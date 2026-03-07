const { db } = require("../../db/index");
const Yup = require("yup");

class AppointmentsController {
  async store(req, res) {
    try {
      if (req.role !== "RESPONSAVEL") {
        return res.status(403).json({
          data: null,
          error: "Apenas responsáveis podem criar agendamentos.",
        });
      }

      const schema = Yup.object().shape({
        caregiverId: Yup.string().uuid().required(),
        startAt: Yup.date().required(),
        endAt: Yup.date()
          .required()
          .min(
            Yup.ref("startAt"),
            "Data de término deve ser após a de início.",
          ),
        notes: Yup.string().nullable(),
      });

      await schema.validate(req.body, { abortEarly: false });

      const { caregiverId, startAt, endAt, notes } = req.body;
      const startDate = new Date(startAt);
      const endDate = new Date(endAt);

      // 1. Verificar se a cuidadora existe e obter valor da hora
      const profile = await db.caregiverProfile.findUnique({
        where: { userId: caregiverId },
      });

      if (!profile) {
        return res.status(404).json({
          data: null,
          error:
            "Cuidadora não encontrada ou perfil profissional não configurado.",
        });
      }

      // 2. Verificar Disponibilidade Semanal
      const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      const weekday = weekdays[startDate.getDay()];
      const startMin = startDate.getHours() * 60 + startDate.getMinutes();
      const endMin = endDate.getHours() * 60 + endDate.getMinutes();

      const availability = await db.caregiverWeeklyAvailability.findFirst({
        where: {
          caregiverId,
          weekday,
          isActive: true,
          startMin: { lte: startMin },
          endMin: { gte: endMin },
        },
      });

      if (!availability) {
        return res.status(400).json({
          data: null,
          error:
            "A cuidadora não possui disponibilidade nesta janela de horário semanal.",
        });
      }

      // 3. Verificar Blocos de Indisponibilidade
      const block = await db.caregiverAvailabilityBlock.findFirst({
        where: {
          caregiverId,
          type: "UNAVAILABLE",
          OR: [
            { startAt: { lte: startDate }, endAt: { gte: startDate } },
            { startAt: { lte: endDate }, endAt: { gte: endDate } },
            { startAt: { gte: startDate }, endAt: { lte: endDate } },
          ],
        },
      });

      if (block) {
        return res.status(400).json({
          data: null,
          error: "A cuidadora possui um bloqueio de agenda neste período.",
        });
      }

      // 4. Verificar conflito com outros Appointments (PENDENTE ou CONFIRMADO)
      const conflict = await db.appointment.findFirst({
        where: {
          caregiverId,
          status: { in: ["PENDENTE", "CONFIRMADO"] },
          OR: [
            { startAt: { lte: startDate }, endAt: { gt: startDate } },
            { startAt: { lt: endDate }, endAt: { gte: endDate } },
            { startAt: { gte: startDate }, endAt: { lte: endDate } },
          ],
        },
      });

      if (conflict) {
        return res.status(400).json({
          data: null,
          error: "Conflito de horário com outro agendamento já existente.",
        });
      }

      // Calcular valor total
      const diffMs = endDate - startDate;
      const diffHours = diffMs / (1000 * 60 * 60);
      const totalCents = Math.round(diffHours * profile.hourlyRateCents);

      const appointment = await db.appointment.create({
        data: {
          parentId: req.userId,
          caregiverId,
          startAt: startDate,
          endAt: endDate,
          notes,
          status: "PENDENTE",
          hourlyRateCents: profile.hourlyRateCents,
          totalCents,
        },
      });

      return res.status(201).json({ data: appointment, error: null });
    } catch (error) {
      if (error instanceof Yup.ValidationError)
        return res.status(400).json({
          data: null,
          error: "Erro de validação",
          details: error.errors,
        });
      return res.status(500).json({
        data: null,
        error: "Erro ao criar agendamento: " + error.message,
      });
    }
  }

  async index(req, res) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const skip = (page - 1) * limit;

      const where = {};

      if (req.role === "RESPONSAVEL") {
        where.parentId = req.userId;
      } else if (req.role === "CUIDADORA") {
        where.caregiverId = req.userId;
      } else if (req.role !== "ADMIN") {
        return res.status(403).json({ data: null, error: "Não autorizado." });
      }

      if (status) where.status = status;

      const [items, total] = await Promise.all([
        db.appointment.findMany({
          where,
          include: {
            parent: { select: { name: true, avatarUrl: true } },
            caregiver: { select: { name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: Number(limit),
        }),
        db.appointment.count({ where }),
      ]);

      return res.json({
        data: { items, total, page: Number(page), limit: Number(limit) },
        error: null,
      });
    } catch (error) {
      return res.status(500).json({
        data: null,
        error: "Erro ao buscar agendamentos: " + error.message,
      });
    }
  }

  async show(req, res) {
    try {
      const appointment = await db.appointment.findUnique({
        where: { id: req.params.id },
        include: {
          parent: { select: { name: true, avatarUrl: true, phone: true } },
          caregiver: { select: { name: true, avatarUrl: true, phone: true } },
          payment: true,
          review: true,
        },
      });

      if (!appointment)
        return res
          .status(404)
          .json({ data: null, error: "Agendamento não encontrado." });

      const isParticipant =
        appointment.parentId === req.userId ||
        appointment.caregiverId === req.userId ||
        req.role === "ADMIN";
      if (!isParticipant)
        return res.status(403).json({ data: null, error: "Não autorizado." });

      return res.json({ data: appointment, error: null });
    } catch (error) {
      return res.status(500).json({
        data: null,
        error: "Erro ao buscar agendamento: " + error.message,
      });
    }
  }

  async confirm(req, res) {
    try {
      const appointment = await db.appointment.findUnique({
        where: { id: req.params.id },
      });
      if (!appointment || appointment.caregiverId !== req.userId) {
        return res
          .status(404)
          .json({ data: null, error: "Agendamento não encontrado." });
      }
      if (appointment.status !== "PENDENTE") {
        return res.status(400).json({
          data: null,
          error: "Apenas agendamentos pendentes podem ser confirmados.",
        });
      }

      const updated = await db.appointment.update({
        where: { id: req.params.id },
        data: { status: "CONFIRMADO" },
      });

      return res.json({ data: updated, error: null });
    } catch (error) {
      return res.status(500).json({
        data: null,
        error: "Erro ao confirmar agendamento: " + error.message,
      });
    }
  }

  async refuse(req, res) {
    try {
      const appointment = await db.appointment.findUnique({
        where: { id: req.params.id },
      });
      if (!appointment || appointment.caregiverId !== req.userId) {
        return res
          .status(404)
          .json({ data: null, error: "Agendamento não encontrado." });
      }

      const updated = await db.appointment.update({
        where: { id: req.params.id },
        data: { status: "RECUSADO" },
      });

      return res.json({ data: updated, error: null });
    } catch (error) {
      return res.status(500).json({
        data: null,
        error: "Erro ao recusar agendamento: " + error.message,
      });
    }
  }

  async cancel(req, res) {
    try {
      const appointment = await db.appointment.findUnique({
        where: { id: req.params.id },
      });
      if (!appointment || appointment.parentId !== req.userId) {
        return res
          .status(404)
          .json({ data: null, error: "Agendamento não encontrado." });
      }

      const updated = await db.appointment.update({
        where: { id: req.params.id },
        data: { status: "CANCELADO" },
      });

      return res.json({ data: updated, error: null });
    } catch (error) {
      return res.status(500).json({
        data: null,
        error: "Erro ao cancelar agendamento: " + error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const appointment = await db.appointment.findUnique({
        where: { id: req.params.id },
      });
      if (!appointment)
        return res
          .status(404)
          .json({ data: null, error: "Agendamento não encontrado." });

      const isOwner =
        appointment.parentId === req.userId || req.role === "ADMIN";
      if (!isOwner)
        return res.status(403).json({ data: null, error: "Não autorizado." });

      await db.appointment.delete({ where: { id: req.params.id } });
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({
        data: null,
        error: "Erro ao remover agendamento: " + error.message,
      });
    }
  }
}

module.exports = new AppointmentsController();

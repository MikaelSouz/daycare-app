const { db } = require("../../db/index");
const Yup = require("yup");

class PaymentsController {
  async store(req, res) {
    try {
      const schema = Yup.object().shape({
        appointmentId: Yup.string().uuid().required(),
        method: Yup.mixed().oneOf(["PIX", "CARD"]).required(),
      });

      await schema.validate(req.body);
      const { appointmentId, method } = req.body;

      const appointment = await db.appointment.findUnique({
        where: { id: appointmentId },
        include: { payment: true }
      });

      if (!appointment || appointment.parentId !== req.userId) {
        return res.status(404).json({ data: null, error: "Agendamento não encontrado." });
      }

      if (appointment.payment) {
        return res.status(400).json({ data: null, error: "Este agendamento já possui um pagamento associado." });
      }

      const payment = await db.payment.create({
        data: {
          appointmentId,
          method,
          amountCents: appointment.totalCents,
          status: "PAGO", // Simulação de pagamento imediato para MVP
          paidAt: new Date()
        }
      });

      return res.status(201).json({ data: payment, error: null });
    } catch (error) {
      return res.status(500).json({ data: null, error: "Erro ao processar pagamento: " + error.message });
    }
  }

  async index(req, res) {
    try {
      const where = {};
      if (req.role === "RESPONSAVEL") {
        where.appointment = { parentId: req.userId };
      } else if (req.role === "CUIDADORA") {
        where.appointment = { caregiverId: req.userId };
      }

      const payments = await db.payment.findMany({
        where,
        include: {
          appointment: {
            include: {
              parent: { select: { name: true } },
              caregiver: { select: { name: true } }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      });

      return res.json({ data: payments, error: null });
    } catch (error) {
      return res.status(500).json({ data: null, error: "Erro ao buscar pagamentos: " + error.message });
    }
  }

  async stats(req, res) {
    try {
      if (req.role !== "CUIDADORA") {
        return res.status(403).json({ data: null, error: "Apenas cuidadoras acessam estatísticas de ganhos." });
      }

      const { days = 7 } = req.query;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Number(days));

      const payments = await db.payment.findMany({
        where: {
          appointment: { caregiverId: req.userId },
          status: "PAGO",
          createdAt: { gte: startDate }
        },
        select: {
          amountCents: true,
          createdAt: true
        }
      });

      // Agrupamento simples por dia
      const stats = payments.reduce((acc, curr) => {
        const date = curr.createdAt.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + curr.amountCents;
        return acc;
      }, {});

      return res.json({ data: stats, error: null });
    } catch (error) {
      return res.status(500).json({ data: null, error: "Erro ao buscar estatísticas: " + error.message });
    }
  }
}

module.exports = new PaymentsController();

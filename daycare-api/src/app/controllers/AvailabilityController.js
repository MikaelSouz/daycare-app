const { db } = require("../../db/index");
const Yup = require("yup");

class AvailabilityController {
  /**
   * Weekly Availability Methods
   */

  async getWeekly(req, res) {
    try {
      if (req.role !== "CUIDADORA") {
        return res.status(403).json({
          data: null,
          error:
            "Apenas cuidadoras podem gerenciar sua disponibilidade semanal.",
        });
      }

      const availability = await db.caregiverWeeklyAvailability.findMany({
        where: { caregiverId: req.userId },
        orderBy: [{ weekday: "asc" }, { startMin: "asc" }],
      });

      return res.json({ data: availability, error: null });
    } catch (error) {
      return res.status(500).json({
        data: null,
        error: "Erro ao buscar disponibilidade semanal: " + error.message,
      });
    }
  }

  async storeWeekly(req, res) {
    try {
      if (req.role !== "CUIDADORA") {
        return res.status(403).json({
          data: null,
          error:
            "Apenas cuidadoras podem gerenciar sua disponibilidade semanal.",
        });
      }

      const schema = Yup.object().shape({
        weekday: Yup.mixed()
          .oneOf(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"])
          .required(),
        startMin: Yup.number().integer().min(0).max(1439).required(),
        endMin: Yup.number()
          .integer()
          .min(0)
          .max(1439)
          .required()
          .moreThan(
            Yup.ref("startMin"),
            "O horário de término deve ser após o de início.",
          ),
      });

      await schema.validate(req.body, { abortEarly: false });

      const newAvailability = await db.caregiverWeeklyAvailability.create({
        data: {
          ...req.body,
          caregiverId: req.userId,
        },
      });

      return res.status(201).json({ data: newAvailability, error: null });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        return res
          .status(400)
          .json({
            data: null,
            error: "Erro de validação",
            details: error.errors,
          });
      }
      return res.status(500).json({
        data: null,
        error: "Erro ao criar disponibilidade: " + error.message,
      });
    }
  }

  async updateWeekly(req, res) {
    try {
      const { id } = req.params;

      const availability = await db.caregiverWeeklyAvailability.findUnique({
        where: { id },
      });

      if (!availability || availability.caregiverId !== req.userId) {
        return res
          .status(404)
          .json({ data: null, error: "Disponibilidade não encontrada." });
      }

      const schema = Yup.object().shape({
        weekday: Yup.mixed().oneOf([
          "MON",
          "TUE",
          "WED",
          "THU",
          "FRI",
          "SAT",
          "SUN",
        ]),
        startMin: Yup.number().integer().min(0).max(1439),
        endMin: Yup.number().integer().min(0).max(1439),
        isActive: Yup.boolean(),
      });

      await schema.validate(req.body, { abortEarly: false });

      const updated = await db.caregiverWeeklyAvailability.update({
        where: { id },
        data: req.body,
      });

      return res.json({ data: updated, error: null });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        return res
          .status(400)
          .json({
            data: null,
            error: "Erro de validação",
            details: error.errors,
          });
      }
      return res.status(500).json({
        data: null,
        error: "Erro ao atualizar disponibilidade: " + error.message,
      });
    }
  }

  async deleteWeekly(req, res) {
    try {
      const { id } = req.params;

      const availability = await db.caregiverWeeklyAvailability.findUnique({
        where: { id },
      });

      if (!availability || availability.caregiverId !== req.userId) {
        return res
          .status(404)
          .json({ data: null, error: "Disponibilidade não encontrada." });
      }

      await db.caregiverWeeklyAvailability.delete({ where: { id } });

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({
        data: null,
        error: "Erro ao excluir disponibilidade: " + error.message,
      });
    }
  }

  /**
   * Availability Blocks Methods
   */

  async getBlocks(req, res) {
    try {
      if (req.role !== "CUIDADORA") {
        return res.status(403).json({
          data: null,
          error: "Apenas cuidadoras podem gerenciar seus bloqueios.",
        });
      }

      const { futureOnly = "true" } = req.query;

      const where = { caregiverId: req.userId };
      if (futureOnly === "true") {
        where.endAt = { gte: new Date() };
      }

      const blocks = await db.caregiverAvailabilityBlock.findMany({
        where,
        orderBy: { startAt: "asc" },
      });

      return res.json({ data: blocks, error: null });
    } catch (error) {
      return res.status(500).json({
        data: null,
        error: "Erro ao buscar bloqueios: " + error.message,
      });
    }
  }

  async storeBlock(req, res) {
    try {
      if (req.role !== "CUIDADORA") {
        return res.status(403).json({
          data: null,
          error: "Apenas cuidadoras podem gerenciar seus bloqueios.",
        });
      }

      const schema = Yup.object().shape({
        type: Yup.mixed()
          .oneOf(["AVAILABLE", "UNAVAILABLE"])
          .default("UNAVAILABLE"),
        startAt: Yup.date().required(),
        endAt: Yup.date()
          .required()
          .min(
            Yup.ref("startAt"),
            "A data de término deve ser após a de início.",
          ),
        reason: Yup.string().nullable(),
      });

      await schema.validate(req.body, { abortEarly: false });

      const block = await db.caregiverAvailabilityBlock.create({
        data: {
          ...req.body,
          caregiverId: req.userId,
          createdByUserId: req.userId,
        },
      });

      return res.status(201).json({ data: block, error: null });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        return res
          .status(400)
          .json({
            data: null,
            error: "Erro de validação",
            details: error.errors,
          });
      }
      return res.status(500).json({
        data: null,
        error: "Erro ao criar bloqueio: " + error.message,
      });
    }
  }

  async updateBlock(req, res) {
    try {
      const { id } = req.params;

      const block = await db.caregiverAvailabilityBlock.findUnique({
        where: { id },
      });

      if (!block || block.caregiverId !== req.userId) {
        return res
          .status(404)
          .json({ data: null, error: "Bloqueio não encontrado." });
      }

      const schema = Yup.object().shape({
        type: Yup.mixed().oneOf(["AVAILABLE", "UNAVAILABLE"]),
        startAt: Yup.date(),
        endAt: Yup.date().min(
          Yup.ref("startAt"),
          "A data de término deve ser após a de início.",
        ),
        reason: Yup.string().nullable(),
      });

      await schema.validate(req.body, { abortEarly: false });

      const updated = await db.caregiverAvailabilityBlock.update({
        where: { id },
        data: req.body,
      });

      return res.json({ data: updated, error: null });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        return res
          .status(400)
          .json({
            data: null,
            error: "Erro de validação",
            details: error.errors,
          });
      }
      return res.status(500).json({
        data: null,
        error: "Erro ao atualizar bloqueio: " + error.message,
      });
    }
  }

  async deleteBlock(req, res) {
    try {
      const { id } = req.params;

      const block = await db.caregiverAvailabilityBlock.findUnique({
        where: { id },
      });

      if (!block || block.caregiverId !== req.userId) {
        return res
          .status(404)
          .json({ data: null, error: "Bloqueio não encontrado." });
      }

      await db.caregiverAvailabilityBlock.delete({ where: { id } });

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({
        data: null,
        error: "Erro ao excluir bloqueio: " + error.message,
      });
    }
  }
}

module.exports = new AvailabilityController();

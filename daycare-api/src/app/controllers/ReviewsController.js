const { db } = require("../../db/index");
const Yup = require("yup");

class ReviewsController {
  async store(req, res) {
    try {
      const schema = Yup.object().shape({
        appointmentId: Yup.string().uuid().required(),
        rating: Yup.number().integer().min(1).max(5).required(),
        comment: Yup.string().nullable(),
      });

      await schema.validate(req.body);
      const { appointmentId, rating, comment } = req.body;

      const appointment = await db.appointment.findUnique({
        where: { id: appointmentId },
        include: { review: true },
      });

      if (!appointment || appointment.parentId !== req.userId) {
        return res
          .status(404)
          .json({ data: null, error: "Agendamento não encontrado." });
      }

      if (
        appointment.status !== "CONCLUIDO" &&
        appointment.status !== "CONFIRMADO"
      ) {
        return res.status(400).json({
          data: null,
          error: "Apenas agendamentos realizados podem ser avaliados.",
        });
      }

      if (appointment.review) {
        return res
          .status(400)
          .json({ data: null, error: "Este agendamento já possui avaliação." });
      }

      // Transação para criar review e atualizar média da cuidadora
      const result = await db.$transaction(async (tx) => {
        const review = await tx.review.create({
          data: {
            appointmentId,
            authorId: req.userId,
            targetId: appointment.caregiverId,
            rating,
            comment,
          },
        });

        // Buscar todas as avaliações da cuidadora
        const allReviews = await tx.review.findMany({
          where: { targetId: appointment.caregiverId },
          select: { rating: true },
        });

        const count = allReviews.length;
        const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / count;

        await tx.caregiverProfile.update({
          where: { userId: appointment.caregiverId },
          data: {
            ratingCount: count,
            ratingAvg: avg,
          },
        });

        return review;
      });

      return res.status(201).json({ data: result, error: null });
    } catch (error) {
      return res.status(500).json({
        data: null,
        error: "Erro ao salvar avaliação: " + error.message,
      });
    }
  }

  async listByCaregiver(req, res) {
    try {
      const { id } = req.params;

      const caregiver = await db.caregiverProfile.findUnique({
        where: { id },
      });

      const reviews = await db.review.findMany({
        where: { targetId: caregiver.userId },
        include: {
          author: { select: { name: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return res.json({ data: reviews, error: null });
    } catch (error) {
      return res.status(500).json({
        data: null,
        error: "Erro ao buscar avaliações: " + error.message,
      });
    }
  }
}

module.exports = new ReviewsController();

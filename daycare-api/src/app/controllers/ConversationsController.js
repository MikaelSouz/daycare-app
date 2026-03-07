const { db } = require("../../db/index");

class ConversationsController {
  async direct(req, res) {
    try {
      const { caregiverId } = req.body;
      if (!caregiverId)
        return res.status(400).json({ error: "caregiverId é obrigatório" });

      const responsibleId = req.userId;

      // Chave única para conversa direta (garante 1:1)
      const ids = [responsibleId, caregiverId].sort();
      const directKey = `direct:${ids[0]}:${ids[1]}`;

      const conversation = await db.conversation.upsert({
        where: { directKey },
        update: {},
        create: {
          isDirect: true,
          directKey,
          participants: {
            create: [{ userId: responsibleId }, { userId: caregiverId }],
          },
        },
        include: {
          participants: {
            include: { user: { select: { name: true, avatarUrl: true } } },
          },
        },
      });

      return res.json({ data: conversation, error: null });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao acessar conversa: " + error.message });
    }
  }

  async index(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const where = {
        participants: { some: { userId: req.userId } },
      };

      const [items, total] = await Promise.all([
        db.conversation.findMany({
          where,
          include: {
            participants: {
              where: { userId: { not: req.userId } },
              include: { user: { select: { name: true, avatarUrl: true } } },
            },
          },
          orderBy: { lastMessageAt: "desc" },
          skip,
          take: Number(limit),
        }),
        db.conversation.count({ where }),
      ]);

      return res.json({
        data: { items, total, page: Number(page), limit: Number(limit) },
        error: null,
      });
    } catch (error) {
      return res.status(500).json({
        data: null,
        error: "Erro ao buscar conversas: " + error.message,
      });
    }
  }

  async show(req, res) {
    try {
      const conversation = await db.conversation.findUnique({
        where: { id: req.params.id },
        include: {
          participants: {
            include: {
              user: { select: { id: true, name: true, avatarUrl: true } },
            },
          },
        },
      });

      if (!conversation)
        return res.status(404).json({ error: "Conversa não encontrada" });

      const isParticipant = conversation.participants.some(
        (p) => p.userId === req.userId,
      );
      if (!isParticipant)
        return res.status(403).json({ error: "Não autorizado" });

      return res.json({ data: conversation, error: null });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao buscar conversa: " + error.message });
    }
  }
}

module.exports = new ConversationsController();

const { db } = require("../../db/index");

class MessagesController {
  async index(req, res) {
    try {
      const { id: conversationId } = req.params;
      const { page = 1, limit = 50 } = req.query;
      const skip = (page - 1) * limit;

      // Verificar se o usuário é participante
      const participant = await db.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId,
            userId: req.userId
          }
        }
      });

      if (!participant) {
        return res.status(403).json({ data: null, error: "Não autorizado" });
      }

      const where = { conversationId };

      const [items, total] = await Promise.all([
        db.message.findMany({
          where,
          include: {
            sender: { select: { name: true, avatarUrl: true } }
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: Number(limit)
        }),
        db.message.count({ where })
      ]);

      return res.json({
        data: { items, total, page: Number(page), limit: Number(limit) },
        error: null
      });
    } catch (error) {
      return res.status(500).json({
        data: null,
        error: "Erro ao buscar mensagens: " + error.message
      });
    }
  }

  async store(req, res) {
    try {
      const { id: conversationId } = req.params;
      const { content } = req.body;

      if (!content) return res.status(400).json({ error: "Conteúdo da mensagem é obrigatório" });

      // Verificar se o usuário é participante
      const participant = await db.conversationParticipant.findUnique({
        where: {
          conversationId_userId: {
            conversationId,
            userId: req.userId
          }
        }
      });

      if (!participant) {
        return res.status(403).json({ data: null, error: "Não autorizado" });
      }

      const [message, _] = await db.$transaction([
        db.message.create({
          data: {
            conversationId,
            senderId: req.userId,
            content
          }
        }),
        db.conversation.update({
          where: { id: conversationId },
          data: {
            lastMessageAt: new Date(),
            lastMessageText: content
          }
        })
      ]);

      return res.status(201).json({ data: message, error: null });
    } catch (error) {
      return res.status(500).json({
        data: null,
        error: "Erro ao enviar mensagem: " + error.message
      });
    }
  }

  async read(req, res) {
    try {
      const { id: conversationId } = req.params;

      await db.conversationParticipant.update({
        where: {
          conversationId_userId: {
            conversationId,
            userId: req.userId
          }
        },
        data: { lastReadAt: new Date() }
      });

      return res.json({ data: { success: true }, error: null });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao marcar como lida: " + error.message });
    }
  }
}

module.exports = new MessagesController();

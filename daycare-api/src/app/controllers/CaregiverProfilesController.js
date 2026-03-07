const { db } = require("../../db/index");
const Yup = require("yup");

class CaregiverProfilesController {
  /**
   * GET /caregivers
   * Busca cuidadoras com filtros e paginação
   */
  async index(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        city,
        state,
        minExperience,
        maxHourlyRate,
        minRating,
        name,
        sort = "createdAt",
        order = "desc",
      } = req.query;

      const skip = (page - 1) * limit;
      const take = Number(limit);

      const where = {
        user: {
          isActive: true,
        },
      };

      if (city) {
        where.city = { contains: city, mode: "insensitive" };
      }

      if (state) {
        where.state = { contains: state, mode: "insensitive" };
      }

      if (minExperience) {
        where.experienceYears = { gte: Number(minExperience) };
      }

      if (maxHourlyRate) {
        where.hourlyRateCents = { lte: Number(maxHourlyRate) };
      }

      if (minRating) {
        where.ratingAvg = { gte: Number(minRating) };
      }

      if (name) {
        where.user.name = { contains: name, mode: "insensitive" };
      }

      const [items, total] = await Promise.all([
        db.caregiverProfile.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                phone: true,
              },
            },
          },
          orderBy: { [sort]: order },
          skip,
          take,
        }),
        db.caregiverProfile.count({ where }),
      ]);

      return res.json({
        data: {
          items,
          page: Number(page),
          limit: take,
          total,
        },
        error: null,
      });
    } catch (error) {
      return res.status(500).json({
        data: null,
        error: "Erro ao buscar cuidadoras: " + error.message,
      });
    }
  }

  /**
   * GET /caregivers/:id
   * Detalhes de uma cuidadora específica
   */
  async show(req, res) {
    try {
      const { id } = req.params;

      const caregiver = await db.caregiverProfile.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              phone: true,
              isActive: true,
              birthDate: true,
              weeklyAvailability: {
                select: {
                  caregiverId: true,
                  isActive: true,
                  startMin: true,
                  endMin: true,
                  weekday: true,
                },
              },
            },
          },
        },
      });

      if (!caregiver || !caregiver.user.isActive) {
        return res.status(404).json({
          data: null,
          error: "Cuidadora não encontrada.",
        });
      }

      return res.json({
        data: caregiver,
        error: null,
      });
    } catch (error) {
      return res.status(500).json({
        data: null,
        error: "Erro ao buscar cuidadora: " + error.message,
      });
    }
  }

  async showMe(req, res) {
    try {
      const userId = req.userId;

      const caregiver = await db.caregiverProfile.findFirst({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              phone: true,
              isActive: true,
            },
          },
        },
      });

      if (!caregiver || !caregiver.user.isActive) {
        return res.status(404).json({
          data: null,
          error: "Cuidadora não encontrada.",
        });
      }

      return res.json({
        data: caregiver,
        error: null,
      });
    } catch (error) {
      return res.status(500).json({
        data: null,
        error: "Erro ao buscar cuidadora: " + error.message,
      });
    }
  }

  /**
   * PATCH /caregivers/me
   * Atualiza (ou cria) o perfil da própria cuidadora logada
   */
  async updateMe(req, res) {
    try {
      if (req.role !== "CUIDADORA") {
        return res.status(403).json({
          data: null,
          error: "Apenas cuidadoras podem gerenciar seu perfil profissional.",
        });
      }

      const schema = Yup.object().shape({
        bio: Yup.string().max(1000),
        hourlyRateCents: Yup.number().integer().min(0),
        city: Yup.string(),
        state: Yup.string(),
        timeZone: Yup.string(),
        experienceYears: Yup.number().integer().min(0),
        maxChildren: Yup.number().integer().min(1),
        specialties: Yup.array().notRequired(),
      });

      await schema.validate(req.body, { abortEarly: false });

      // Upsert: atualiza se existir, cria se não
      const profile = await db.caregiverProfile.upsert({
        where: { userId: req.userId },
        update: req.body,
        create: {
          ...req.body,
          userId: req.userId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      });

      return res.json({
        data: profile,
        error: null,
      });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        return res.status(400).json({
          data: null,
          error: "Erro de validação",
          details: error.errors,
        });
      }

      return res.status(500).json({
        data: null,
        error: "Erro ao atualizar perfil: " + error.message,
      });
    }
  }
}

module.exports = new CaregiverProfilesController();

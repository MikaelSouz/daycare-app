const { db } = require("../../db/index");
const Yup = require("yup");
const { hash, compare } = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

class UserController {
  async create(req, res) {
    try {
      const { email } = req.body;

      const schema = Yup.object().shape({
        name: Yup.string()
          .required()
          .min(3, "Nome deve conter no mínimo 3 caracteres."),
        email: Yup.string().email().required(),
        password: Yup.string()
          .required()
          .min(6, "Senha deve conter no mínimo 6 caracteres."),
        role: Yup.mixed().oneOf(["RESPONSAVEL", "CUIDADORA"]).required(),
      });

      await schema.validate(req.body);

      const existedUser = await db.user.findUnique({ where: { email } });

      if (existedUser) {
        return res.status(400).json({ error: "Usuário já cadastrado." });
      }

      const passwordHash = await hash(req.body.password, 10);

      const save = await db.user.create({
        data: {
          name: req.body.name,
          email: req.body.email,
          role: req.body.role,
          passwordHash,
        },
      });

      const { password, ...safeUser } = req.body;

      return res.json({ safeUser });
    } catch (error) {
      return res
        .status(400)
        .json({ error: error?.message && error?.inner && error?.errors });
    }
  }

  async login(req, res) {
    try {
      const schema = Yup.object().shape({
        email: Yup.string().required().email(),
        password: Yup.string().required(),
      });

      await schema.validate(req.body);

      const user = await db.user.findFirst({
        where: {
          email: req.body.email,
        },
      });

      if (!user) {
        return res.status(401).json({ error: "Email não cadastrado" });
      }

      const checkPassword = await compare(
        req.body.password,
        user?.passwordHash,
      );

      if (!checkPassword) {
        return res.status(401).json({ error: "Usuário ou senha inválidos." });
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_HASH,
        {
          expiresIn: "30d",
        },
      );

      const { id, name, email, createdAt, role } = user;

      return res.json({
        user: {
          id,
          name,
          email,
          createdAt,
          role,
        },
        token,
      });
    } catch (error) {
      return res
        .status(400)
        .json({ error: error?.message && error?.inner && error?.errors });
    }
  }

  async show(req, res) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(404).json({ error: "Informe o id do usuário." });
      }

      const user = await db.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res
          .status(404)
          .json({ error: "Dados do usuário não encontrados." });
      }

      const result = {
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      };

      return res.json(result);
    } catch (error) {
      return res
        .status(500)
        .json({ error: error.message ?? error.errors ?? error.inner });
    }
  }
}

module.exports = new UserController();

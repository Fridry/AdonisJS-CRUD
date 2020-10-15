"use strict";

const User = use("App/Models/User");

class UserController {
  async index() {
    try {
      const users = await User.query()
        .select("id", "username", "email")
        .fetch();

      return users;
    } catch (error) {
      return response.status(500).json({ erro: error.message });
    }
  }

  async show({ params, response }) {
    try {
      const user = await User.query().where("id", params.id).first();

      if (!user) {
        return response
          .status(404)
          .json({ message: "Nenhum usuário localizado" });
      }

      return user;
    } catch (error) {
      return response.status(500).json({ erro: error.message });
    }
  }

  async update({ params, response, request, auth }) {
    try {
      const user = await User.query().where("id", params.id).first();

      if (!user) {
        return response
          .status(404)
          .json({ message: "Nenhum usuário localizado" });
      }

      if (user.id !== auth.user.id) {
        return response.status(401).json({ message: "Não autorizado" });
      }

      const data = request.only(["username", "email", "password"]);

      user.merge(data);

      await user.save();

      return user;
    } catch (error) {
      return response.status(500).json({ erro: error.message });
    }
  }

  async destroy({ params, auth, response }) {
    try {
      const user = await User.query()
        .where("id", params.id)
        .where("id", auth.user.id)
        .first();

      if (!user) {
        return response
          .status(404)
          .json({ message: "Nenhum usuário localizado" });
      }

      if (user.id !== auth.user.id) {
        return response.status(401).json({ message: "Não autorizado" });
      }

      await user.delete();
    } catch (error) {
      return response.status(500).json({ erro: error.message });
    }
  }
}

module.exports = UserController;

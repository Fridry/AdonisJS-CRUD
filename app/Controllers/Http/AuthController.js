"use strict";

const User = use("App/Models/User");
const { validateAll } = use("Validator");

class AuthController {
  async register({ request, response }) {
    try {
      const errorMessage = {
        "username.required": "Campo obrigatório",
        "username.unique": "Usuário indisponível",
        "username.min": "O usuário deve ter 5 ou mais caracteres",
        "email.required": "Campo obrigatório",
        "email.email": "E-mail inválido",
        "email.unique": "Email indisponível",
        "password.required": "Campo obrigatório",
        "password.min": "A senha deve ter 6 ou mais caracteres",
      };

      const validation = await validateAll(
        request.all(),
        {
          username: "required|min:5|unique:users",
          email: "required|email|unique:users",
          password: "required|min:6",
        },
        errorMessage
      );

      if (validation.fails()) {
        return response.status(401).json({ message: validation.messages() });
      }

      const data = request.only(["username", "email", "password"]);

      const user = await User.create(data);

      return user;
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  }

  async authenticate({ request, response, auth }) {
    try {
      const { email, password } = request.all();

      const token = await auth.attempt(email, password);

      return token;
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  }
}

module.exports = AuthController;

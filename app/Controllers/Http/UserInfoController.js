"use strict";

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const UserInfo = use("App/Models/UserInfo");
const User = use("App/Models/User");
const { validateAll } = use("Validator");

/**
 * Resourceful controller for interacting with userinfos
 */
class UserInfoController {
  /**
   * Show a list of all userinfos.
   * GET userinfos
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async index({ request, response }) {
    try {
      const usersInfo = await UserInfo.query().fetch();
      // const usersInfo = await UserInfo.query().with("users").fetch();

      return usersInfo;
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  }

  /**
   * Create/save a new userinfo.
   * POST userinfos
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response, auth }) {
    try {
      const user = await User.findOrFail(auth.user.id);

      if (!user) {
        return response.status(404).json({ message: "Usuário não encontrado" });
      }

      const errorMessage = {
        "name.required": "Campo obrigatório",
        "birth_date.required": "Campo obrigatório",
        "gender.required": "Campo obrigatório",
        "gender.in": "Gênero inválido",
        "cpf.required": "Campo obrigatório",
        "cpf.unique": "CPF já cadastrado",
        "cpf.min": "CPF deve ter 11 digitos válidos",
        "cpf.max": "CPF deve ter 11 digitos válidos",
        "rg.required": "Campo obrigatório",
        "rg.unique": "RG já cadastrado",
        "rg.min": "RG deve ter no mínimo 7 digitos válidos",
        "rg.max": "RG deve ter no máximo 10 digitos válidos",
        "phone_number.required": "Campo obrigatório",
        "address.required": "Campo obrigatório",
        "zip_code.required": "Campo obrigatório",
        "city.required": "Campo obrigatório",
      };

      const validation = await validateAll(
        request.all(),
        {
          name: "required",
          birth_date: "required",
          gender: "required|in:Masculino,Feminino,Outro",
          cpf: "required|unique:user_infos|min:11|max:11",
          rg: "required|unique:user_infos|min:7|max:10",
          phone_number: "required",
          address: "required",
          zip_code: "required",
          city: "required",
        },
        errorMessage
      );

      if (validation.fails()) {
        return response.status(401).json({ message: validation.messages() });
      }

      const data = request.only([
        "name",
        "birth_date",
        "gender",
        "cpf",
        "rg",
        "phone_number",
        "address",
        "zip_code",
        "city",
      ]);

      const userInfo = await UserInfo.create({
        ...data,
        user_id: auth.user.id,
      });

      return userInfo;
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  }

  /**
   * Display a single userinfo.
   * GET userinfos/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params, response, auth }) {
    const userInfo = await UserInfo.query()
      .with("users")
      .where("id", params.id)
      .where("user_id", auth.user.id)
      .first();

    if (!userInfo) {
      return response
        .status(404)
        .json({ message: "Nenhum registro localizado" });
    }

    return userInfo;
  }

  /**
   * Update userinfo details.
   * PUT or PATCH userinfos/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response, auth }) {
    try {
      const userInfo = await UserInfo.findOrFail(params.id);

      if (!userInfo) {
        return response
          .status(404)
          .json({ message: "Registro não encontrado" });
      }

      if (userInfo.user_id !== auth.user.id) {
        return response.status(404).json({ message: "Não autorizado" });
      }

      const errorMessage = {
        "gender.in": "Gênero inválido",
        "cpf.unique": "CPF já cadastrado",
        "cpf.min": "CPF deve ter 11 digitos válidos",
        "cpf.max": "CPF deve ter 11 digitos válidos",
        "rg.unique": "RG já cadastrado",
        "rg.min": "RG deve ter no mínimo 7 digitos válidos",
        "rg.max": "RG deve ter no máximo 10 digitos válidos",
      };

      const validation = await validateAll(
        request.all(),
        {
          gender: "in:Masculino,Feminino,Outro",
          cpf: "unique:user_infos|min:11|max:11",
          rg: "unique:user_infos|min:7|max:10",
        },
        errorMessage
      );

      if (validation.fails()) {
        return response.status(401).json({ message: validation.messages() });
      }

      const data = request.only([
        "name",
        "birth_date",
        "gender",
        "cpf",
        "rg",
        "phone_number",
        "address",
        "zip_code",
        "city",
      ]);

      userInfo.merge(data);

      await userInfo.save();

      return userInfo;
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  }

  /**
   * Delete a userinfo with id.
   * DELETE userinfos/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, response, auth }) {
    const userInfo = await UserInfo.query()
      .where("id", params.id)
      .where("user_id", auth.user.id)
      .first();

    if (!userInfo) {
      return response
        .status(404)
        .json({ message: "Nenhum registro localizado" });
    }

    await userInfo.delete();
  }
}

module.exports = UserInfoController;

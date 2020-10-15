"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class UserInfoSchema extends Schema {
  async up() {
    await this.db.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    this.create("user_infos", (table) => {
      table
        .uuid("id")
        .notNullable()
        .primary()
        .defaultTo(this.db.raw("uuid_generate_v4()"));
      table.string("name", 100).notNullable();
      table.date("birth_date").notNullable();
      table.enu("gender", ["Masculino", "Feminino", "Outro"]).notNullable();
      table.string("cpf", 11).notNullable().unique();
      table.string("rg", 10).notNullable().unique();
      table.string("phone_number", 15).notNullable();
      table.string("address", 100).notNullable();
      table.string("zip_code", 15).notNullable();
      table.string("city", 100).notNullable();
      table
        .uuid("user_id")
        .unsigned()
        .notNullable()
        .references("id")
        .inTable("users")
        .onUpdate("CASCADE")
        .onDelete("CASCADE");
      table.timestamps();
    });
  }

  down() {
    this.drop("user_infos");
  }
}

module.exports = UserInfoSchema;

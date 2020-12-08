const db = require('../../config/db')
const fs = require('fs')

const RecipeFile = require('../models/RecipeFile')

module.exports = {
  async findOne(filters) {
    let query = "SELECT * FROM users"

    Object.keys(filters).map(key => {
      query = ` ${query}
        ${key}
      `

      Object.keys(filters[key]).map(field => {
        query = `${query} ${field} = '${filters[key][field]}'`
      });
    });

    const results = await db.query(query)
    return results.rows[0]
  },
  async create(data) {
    const query = `
      INSERT INTO users (
        name,
        email,
        password,
        is_admin
      ) VALUES ($1, $2, $3, $4)
      RETURNING id
    `
    const values = [
      data.name,
      data.email,
      data.password,
      data.is_admin
    ];

    const results = await db.query(query, values)
    return results.rows[0].id
  },
  async update(id, fields) {

    let query = "UPDATE users SET"

    Object.keys(fields).map((key, index, array) => {
      if ((index + 1) < array.length) {

        // dos fields pegando a chave
        query = `${query}
          ${key} = '${fields[key]}',                
        `
      } else {
        // Ultima parte iteração
        query = `${query}
          ${key} = '${fields[key]}'
          WHERE id = ${id}
        `
      }
    })

    await db.query(query)
    return
  },
  async all() {
    return db.query(`
      SELECT users.*
      FROM users
      ORDER BY users DESC
    `)

  },
  findUser(id) {
    try {
      return db.query(`
        SELECT users.*
        FROM users 
        WHERE users.id = $1`,
        [id]
      );
    } catch (err) {
      throw new Error(err);
    }
  },
  delete(id) {
    return db.query(` DELETE FROM users WHERE id = $1`, [id]);
  },
  async deleteAll(id) {

    // pegar todos os produtos
    let results = await db.query("SELECT * FROM recipes WHERE user_id = $1", [id]);
    const recipes = results.rows;

    // dos produtos, pegar todas as imagens
    const allDeletePromise = recipes.map(recipe =>
      RecipeFile.all(recipe.id));

    let promiseResults = await Promise.all(allDeletePromise);

    // rodar a remoção do usuário
    await db.query('DELETE FROM users WHERE id = $1', [id]);

    // remover as imagens da pasta public
    promiseResults.map(results => {
      results.rows.map(file => {
        try {
          fs.unlinkSync(file.path)
        } catch (err) {
          console.error(err)
        }
      });
    });
  }
}
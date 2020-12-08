const {date, age} = require('../../lib/utils');
const db = require('../../config/db');

module.exports = {
  all(){
    return db.query(`
    SELECT recipes.*, chefs.name AS chef_name
    FROM recipes
    LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
    ORDER BY created_at DESC
    `)
  },
  create(data){
    const query = `
      INSERT INTO recipes (
        title,
        ingredients,
        preparation,
        information,
        chef_id,
        user_id,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `

    const values = [
      data.title,
      data.ingredients,
      data.preparation,
      data.information,
      data.chef,
      data.user_id,
      date(Date.now()).iso
    ];

    return db.query(query, values)
  },
  find(id){
    return db.query(`
      SELECT recipes.*, chefs.name AS chef_name
      FROM recipes
      LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
      WHERE recipes.id = $1`,
      [id]
    );
  },
  findBy(filter){
    return db.query(`
    SELECT recipes.*, chefs.name AS chef_name
    FROM recipes
    LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
    WHERE recipes.title ILIKE '%${filter}%'
    ORDER BY updated_at DESC`);
  },
  update(data){
    const query = `
    UPDATE recipes SET
      title =($1),
      ingredients =($2),
      preparation =($3),
      information =($4),
      chef_id =($5)
    WHERE id = ($6)
    `

    const values = [
      data.title,
      data.ingredients,
      data.preparation,
      data.information,
      data.chef,
      data.id
    ];

    return db.query(query, values)
  },
  delete(id){
    return db.query(`DELETE FROM recipes WHERE id = $1`, [id]);
  },
  chefsSelectOptions(){
    return db.query(`SELECT name, id FROM chefs`)
  }
}
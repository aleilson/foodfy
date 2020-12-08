const {date, age} = require('../../lib/utils');
const db = require('../../config/db');

module.exports = {
  all(){
    return db.query(`
      SELECT chefs.*, count(recipes) AS total_recipes
      FROM chefs
      LEFT JOIN recipes ON (chefs.id = recipes.chef_id)
      GROUP BY chefs.id
      ORDER BY total_recipes DESC
    `);
  },
  create(data){
    try {
      const query = `
        INSERT INTO chefs (
          name,
          file_id
        ) VALUES ($1, $2)
        RETURNING id
      `

      const values = [
        data.name,
        data.fileId,
      ];

      return db.query(query, values)
    } catch (error) {
      throw new Error(error)
    }
  },
  find(id){
    try {
      return db.query(`
        SELECT chefs.*, COUNT(recipes) AS total_recipes
        FROM chefs
        LEFT JOIN recipes ON (chefs.id = recipes.chef_id)
        WHERE chefs.id = $1 
        GROUP BY chefs.id`,
        [id]
      );
    } catch (error) {
      throw new Error(error)
    }
  },
  recipesAllChef(id){
    const query = `SELECT recipes.*, chefs.name AS chef_name
    FROM recipes
    LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
    WHERE chefs.id = $1
    ORDER BY created_at DESC`
    return db.query(query,[id]);
  },
  update(data){
    try {
      const query = `
      UPDATE chefs SET
        name=($1),
        file_id =($2)
      WHERE id = ($3)
      `
  
      const values = [
        data.name,
        data.fileId,
        data.id,
      ];
  
      return db.query(query, values);
    } catch (error) {
      throw new Error(error)
    }
  },
  delete(id){
    return db.query(`DELETE FROM chefs WHERE id = $1`, [id]);
  }
}
const { age, date } = require('../../lib/utils');
const Recipe = require('../models/Recipe');
const Chef = require('../models/Chef');
const RecipeFile = require('../models/RecipeFile');
const File = require('../models/File');

module.exports = {
  async index(req, res){
    try {
      const { filter } = req.query;
      if( filter ){
        let results = await Recipe.findBy(filter);
        const recipes = results.rows.filter((recipe, index) => index > 5 ? false : true)

        async function getImage(recipeId){
          const results = await RecipeFile.find(recipeId);
          const files = results.rows.map(file => ({
            ...file,
            src: `${req.protocol}://${req.headers.host}${file.path.replace('public', '')}`
          }));

          return files[0]
        }

        const filesPromise = await results.rows.map(recipe => getImage(recipe.id));
        const recipeFiles = await Promise.all(filesPromise);

        return res.render('home/searched', { recipes, filter, recipeFiles})
      } else {
        let results = await Recipe.all();
        const recipes = results.rows.filter((product, index) => index >= 6 ? false : true);

        async function getImage(recipeId){
          const results = await RecipeFile.find(recipeId);
          const files = results.rows.map(file => ({
            ...file,
            src: `${req.protocol}://${req.headers.host}${file.path.replace('public', '')}`
          }));

          return files[0]
        }

        const filesPromise = await results.rows.map(recipe => getImage(recipe.id));
        const recipeFiles = await Promise.all(filesPromise);

        return res.render('home/index', { recipes, recipeFiles});
      }
    } catch (error) {
      throw new Error(error);
    }
  },
  async recipes(req, res){
    let results = await Recipe.all();
    const recipes = results.rows;

    async function getImage(recipeId){
      const results = await RecipeFile.find(recipeId);
      const files = results.rows.map(file => ({
        ...file,
        src: `${req.protocol}://${req.headers.host}${file.path.replace('public', '')}`
      }));

      return files[0]
    }

    const filesPromise = await results.rows.map(recipe => getImage(recipe.id));
    const recipeFiles = await Promise.all(filesPromise);

    return res.render('home/recipes', { recipes, recipeFiles })
  },
  about(req, res){
    return res.render('home/about')
  },
  async recipe(req, res){
    try {
      const recipeId = req.params.id;

      let results = await Recipe.find(recipeId);
      const recipe = results.rows[0];

      if(!recipe) return res.send("Recipe not found!");

      recipe.created_at = date(recipe.created_at).format;

      results = await RecipeFile.findByRecipeId(recipeId);
      const recipeFilesPromise = results.rows.map(file => File.find(file.file_id));
      results = await Promise.all(recipeFilesPromise);

      let recipeFiles = results.map(result => result.rows[0]);
      recipeFiles = recipeFiles.map(file => ({
        ...file,
        src: `${req.protocol}://${req.headers.host}${file.path.replace('public', '')}`
      }));

      return res.render("home/recipe", { recipe, recipeFiles })
    } catch (error) {
      throw new Error(error);
      
    }
  },
  async chefs(req, res){
    try {
      let results = await Chef.all();
      const chefs = results.rows;

      const chefsFilesPromise = await chefs.map(chef => File.find(chef.file_id));
      results = await Promise.all(chefsFilesPromise);

      let chefsFiles = results.map(result => result.rows[0]);
      chefsFiles = chefsFiles.map(file => ({
        ...file,
        src: `${req.protocol}://${req.headers.host}${file.path.replace('public', '')}`,
      }));

      return res.render('home/chefs', { chefs, chefsFiles})
    } catch (error) {
      throw new Error(err);
    }
  }
}
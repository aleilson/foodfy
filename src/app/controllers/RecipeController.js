const { age, date } = require('../../lib/utils');

const Recipe = require('../models/Recipe');
const File = require('../models/File');
const RecipeFile = require('../models/RecipeFile');

module.exports = {
  async index(req, res){
    try {
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

      return res.render('admin/recipes/index', {recipes, recipeFiles})
    } catch (error) {
      throw new Error(error);
    }
  },
  create(req, res){
    Recipe.chefsSelectOptions()
    .then(function (results) {
      const chefsOption = results.rows
      return res.render("admin/recipes/create", {
        chefsOption
      })

    }).catch(function (err) {
      throw new Error(err)
    })
    
  },
  async post(req, res){
    const keys = Object.keys(req.body);
    for( key of keys ){
      if(req.body[key] == ""){
        return res.send("Please, fill all fields!")
      };
    }

    if(req.files.length == 0){
      return res.send("Please, send at least one image")
    }

    req.body.user_id = req.session.userId
    //Cadastr a receita
    let results = await Recipe.create(req.body);
    const recipeId = results.rows[0].id; 

    //Cadastra as imagens da receita
    const filesPromise = req.files.map(file => File.create({...file}));
    results = await Promise.all(filesPromise);

    //Une a receita com as imagens e faz a referencias das imagens cadastradas com a receita em questão.
    const recipeFiles = results.map(result => result.rows[0])
    const recipeFilesPromise = recipeFiles.map(file => RecipeFile.create(file.id, recipeId));
    results = await Promise.all(recipeFilesPromise);

    return res.redirect(`/admin/recipes/${recipeId}/edit`);
  },
  async show(req, res){
    const recipeId = req.params.id;

    let results = await Recipe.find(req.params.id);
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

    return res.render("admin/recipes/show", { recipe, recipeFiles })
  },
  async edit(req, res){
    const recipeId = req.params.id;

    let results = await Recipe.find(recipeId);
    const recipe = results.rows[0];
    if(!recipe) return res.send("Recipe not found!")

    results = await Recipe.chefsSelectOptions();
    const chefsOption = results.rows;

    async function getImage(recipeId){
      const results = await RecipeFile.find(recipeId);
      const files = results.rows.map(file => ({
        ...file,
        src: `${req.protocol}://${req.headers.host}${file.path.replace('public', '')}`
      }));

      return files
    }

    const filesPromise = await getImage(recipeId);
    const recipeFiles = await Promise.all(filesPromise);

    return res.render('admin/recipes/edit', { recipe, chefsOption, recipeFiles })
  },
  async put(req, res){
    const keys = Object.keys(req.body);
    const recipeId = req.body.id;

    for( key of keys ){
      if(req.body[key] == "" && key != "removed_files"){
        return res.send("Please, fill all fields!")
      }
    };

    if (req.body.removed_files){
      try {
        const filesId = req.body.removed_files.split(',');
        const lastIndes = filesId.length - 1;
        filesId.splice(lastIndes, 1);

        const recipeFilesDeletePromise = filesId.map(id => RecipeFile.delete(id));
        await Promise.all(recipeFilesDeletePromise);

        const filesDeletePromise = filesId.map(id => File.delete(id));
        await Promise.all(filesDeletePromise);

      } catch (error) {
        throw new Error(error);
      }
    }

    if (req.files != 0){
      try {
        const newFilesPromise = req.files.map(file => File.create({ ...file }));
        const result = await Promise.all(newFilesPromise);

        const recipeFiles = result.map(result => result.rows[0]);
        const recipeFilespromise = recipeFiles.map(file => RecipeFile.create(file.id, recipeId));
        await Promise.all(recipeFilespromise);
        
      } catch (error) {
        throw new Error(error);
      }
    }

    try {
      await Recipe.update(req.body);
      return res.redirect(`/admin/recipes/${recipeId}`)
    } catch (error) {
      throw new Error(error);
    }
  },
  async delete(req, res){
    try {
      const recipeId = req.body.id;
      let results = await RecipeFile.findByRecipeId(recipeId);

      try {
        const recipeFilesDeletePromise = results.rows.map(item => RecipeFile.delete(item.file_id));
        await Promise.all(recipeFilesDeletePromise);

      } catch (error) {
        throw new Error(error);
      }

      try {
        const fileDeletePromise = results.rows.map(item => File.delete(item.file_id));
        await Promise.all(fileDeletePromise);
        
      } catch (error) {
        throw new Error(error);
      }

      await Recipe.delete(recipeId);
      return res.redirect(`/admin/recipes`)
    } catch (error) {
      throw new Error(error);
    }
  }
}

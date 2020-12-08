const { age, date } = require('../../lib/utils');
const Chef = require('../models/Chef');
const File = require('../models/File');
const RecipeFile = require('../models/RecipeFile');

module.exports = {
  async index(req, res){
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
        
      return res.render("admin/chefs/index", { chefs, chefsFiles })
    } catch (err) {
      throw new Error(err);
    }
  },
  create(req, res){
    return res.render('admin/chefs/create')
  },
  async post(req, res){
    const keys = Object.keys(req.body);
    for( key of keys ){
      if(req.body[key] == "" && key != 'removed_files'){
        return res.send("Please, fill all fields!")
      };
    }

    try {
      let results = await File.create(req.file);
      const { id } = results.rows[0];

      const data = {
        ...req.body,
        fileId: id
      };

      results = await Chef.create(data);
      const chefId = results.rows[0].id;

      return res.redirect(`/admin/chefs/${chefId}`)
    } catch (error) {
      throw new Error(error)
    }
  },
  async show(req, res){
    try {
      const chefId = req.params.id;

      let results = await Chef.find(chefId);
      const chef = results.rows[0];

      if(!chef) return res.send("Chef not found!");

      results = await File.find(chef.file_id);
      let chefFile = results.rows[0];
      chefFile = {
        ...chefFile,
        src: `${req.protocol}://${req.headers.host}${chefFile.path.replace('public', '')}`,
      };
      
      results = await Chef.recipesAllChef(chefId);
      const recipes = results.rows;

      async function getImage(recipeId) {
        const results = await RecipeFile.find(recipeId);
        const files = results.rows.map(file => ({
        ...file,
        src: `${req.protocol}://${req.headers.host}${file.path.replace('public','')}`
        }))

        return files[0];
      }
      
      const recipesFilesPromise = recipes.map(recipe => getImage(recipe.id));
      const recipeFiles = await Promise.all(recipesFilesPromise);

      return res.render('admin/chefs/show', {chef, recipes, chefFile, recipeFiles})
    } catch (error) {
      throw new Error(error)
    }
  },
  async edit(req, res){
    let results = await Chef.find(req.params.id);
    const chef = results.rows[0];
    
    if(!chef) return res.send("Chef not found!!");

    results = await File.find(chef.file_id);
    let chefFile = results.rows[0];
    chefFile = {
      ...chefFile,
      src: `${req.protocol}://${req.headers.host}${chefFile.path.replace('public', '')}`,
    };

    return res.render('admin/chefs/edit', { chef, chefFile })
  },
  async put(req, res){
    const keys = Object.keys(req.body)
    const removedImage = req.body.removed_files;

    for(key of keys){
      if(req.body[key] == '' && key != 'removed_files'){
          return res.send('Please fill all fields')
      }
    }

    if (!req.file && removedImage)
      return res.send('Please upload one image')

    let fileNewId = 0;

    if(req.file){
      try{
        const results = await File.create(req.file)
        const { id } = results.rows[0]

        fileNewId = id
      } catch (err){
        throw new Error(err)
      }
    }

    const results = await Chef.find(req.body.id)
    const { file_id } = results.rows[0]
    const oldFileId = file_id

    let data = {
      ...req.body,
      fileId: oldFileId
    }

    if(oldFileId != fileNewId && fileNewId != 0){
      data = {
        ...data,
        fileId: fileNewId
      }
    }

    try{
      await Chef.update(data)

      if(removedImage) {
        try {
          await File.delete(oldFileId);
        } catch (err) {
          throw console.log(err);
        }
      }

      return res.redirect(`/admin/chefs/${req.body.id}`)
    } catch (err) {
      throw new Error(err);
    }
  },
  async delete(req, res){
    await Chef.delete(req.body.id)
    return res.redirect(`/admin/chefs`)
  }
}

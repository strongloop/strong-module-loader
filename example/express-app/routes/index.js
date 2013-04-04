/*
 * GET home page.
 */
 
function index(req, res){
  res.render('index', { title: 'express-app' });
};

/**
 * Set up routes
 */
 
module.exports = function(app, options) {
  app.get('/', index);
  
  
}

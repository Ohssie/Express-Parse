var _ = require('underscore');
var AppConfig = {
    AppName: "Ancaps"
};

module.exports = function (app) {
    app.all('*', function(req, res, next){
        res.locals.flashMessage = { error: [], success: [] }
        req.flash = function(type, message){
            res.locals.flashMessage = res.locals.flashMessage || {} 
            res.locals.flashMessage[type] = res.locals.flashMessage[type] || []
            res.locals.flashMessage[type] = res.locals.flashMessage[type].push(message)
            return res.locals.flashMessage[type]
        }
      next();
    });
};

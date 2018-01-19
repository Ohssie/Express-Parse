var _ = require('underscore');

module.exports = function (app) {
    app.all('*', function(req, res, next){
        // Todo, this is only for authenticated user. else, rewrite this
        req.isWeb = _.has(req.session, 'user') ? true : false;
        next();
    });
};

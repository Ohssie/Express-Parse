var _ = require('underscore');
var AppConfig = {
    AppName: "Ancaps"
};

module.exports = function (app) {
    app.all('*', function(req, res, next){
        if(_.has(req.session, 'user')){
            res.locals.user = req.session.user;
        }else{
            res.locals.user = {
                firstName: 'anonymous', 
                lastName: 'anonymous',
                email: false,
                mobileNumber: false,
            };
        }
        res.locals.AppName = AppConfig.AppName;
        res.locals.flashErrorMessages = req.flash('error');
        res.locals.flashMessages = req.flash('info');
        next();
    });
};

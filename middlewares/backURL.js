module.exports = function (app) {
    app.all('*', function(req, res, next){
        req.backURL = req.header('Referer') || '/';
        next();
    });
};
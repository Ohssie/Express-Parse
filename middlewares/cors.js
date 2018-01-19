var cor = require('../lib/cor');
module.exports = function (app) {
    app.all('*', cor.allowCrossDomain);
};

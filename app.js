
var glob = require('glob');
var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');
var ParseDashboard = require('parse-dashboard');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var flash = require('express-flash');
var bodyParser = require('body-parser');
var compress = require('compression');
var methodOverride = require('method-override');
var flash = require('connect-flash');
var AppConfig = require('./config');

var app = express();

app.set('views',  path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser('S3CRE7'));
app.use(compress());
app.use(express.static('public'));
app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}));
app.use(flash());
var allowInsecureHTTP = true;
var dashboard = new ParseDashboard({
  "apps": [
    {
      "serverURL": AppConfig.SERVER_URL,
      "appId": AppConfig.APP_ID,
      "masterKey": AppConfig.MASTER_KEY,
      "allowInsecureHTTP": true,
      "appName": AppConfig.AppName,
    }
  ],
  "users": [
    {
      "user": AppConfig.DASHBOARD_USER,
      "pass": AppConfig.DASHBOARD_PASS
    }
  ],
}, allowInsecureHTTP);

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var pushConfig = {};

if (process.env.GCM_SENDER_ID && process.env.GCM_API_KEY) {
  pushConfig['android'] = { senderId: process.env.GCM_SENDER_ID || '',
  apiKey: process.env.GCM_API_KEY || ''};
}

if (process.env.APNS_ENABLE) {
  pushConfig['ios'] = [
    {
      pfx: 'ParsePushDevelopmentCertificate.p12', // P12 file only
      bundleId: 'beta.codepath.parsetesting',  // change to match bundleId
      production: false // dev certificate
    }
  ]
}

var api = new ParseServer({
  //You have to choose one database source(either local or online).
  //This is the database for the local database.
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  //This is the database for the database hosted somewhere.
  // databaseURI: databaseUri || 'database_url',  //Endeavour to change 'database_url' to the url of your online database. Must be a string.
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: AppConfig.APP_ID,
  masterKey: AppConfig.MASTER_KEY, //Add your master key here. Keep it secret!
  push: pushConfig,
  serverURL: AppConfig.SERVER_URL,  // Don't forget to change to https if needed
  // liveQuery: {
  //   classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  // }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

// make the Parse Dashboard available at /dashboard
app.use('/dashboard', dashboard);

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var middlewares = glob.sync(path.join(__dirname, '/middlewares/*.js'));
	middlewares.forEach(function (middleware) { 
		require(middleware)(app);
	});
	
var controllers = glob.sync(path.join(__dirname, '/routes/**/*.js'));
	controllers.forEach(function (controller) {
		require(controller)(app);
	});

app.use(function (err, req, res, next) {
  if (err.code === 'EBADCSRFTOKEN'){
     // handle CSRF token errors here
    res.status(500);
    return res.render('505', {message: 'Martian Packet!'});
  }else{
    return next(err);
  }
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
// ParseServer.createLiveQueryServer(httpServer);

#!/bin/env node
 
var express = require('express');

//initializing nconf
var nconf = require('nconf');
nconf.file({file: './conf/config.json'});
global.nconf = nconf;

var http = require('http');
var path = require('path');

var routes = require('./lib/routes');

var mongo = require('mongodb');
var mongoClient = mongo.MongoClient; 

/**
 *  Define the application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        var port = nconf.get('port') || 80;
        port = process.env.OPENSHIFT_NODEJS_PORT || port;
        self.port = port;

        var host = nconf.get('host') || "127.0.0.1";
        host = process.env.OPENSHIFT_NODEJS_IP || host;
        self.ipaddress = host;

        var dbUser = nconf.get('db_user') || "";
        var dbPassword = nconf.get('db_password') || "";
        var dbHost = nconf.get('db_host') || "127.0.0.1";
        var dbPort = nconf.get('db_port') || "27017";
        var dbName = nconf.get('db_name') || "database";

        // if OPENSHIFT env variables are present, use the available connection info:
        if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {

            dbUser = process.env.OPENSHIFT_MONGODB_DB_USERNAME || dbUser;
            dbPassword = process.env.OPENSHIFT_MONGODB_DB_PASSWORD || dbPassword;
            dbHost = process.env.OPENSHIFT_MONGODB_DB_HOST || dbHost;
            dbPort = process.env.OPENSHIFT_MONGODB_DB_PORT || dbPort;
            dbName = process.env.OPENSHIFT_APP_NAME || dbName;
        }

        self.connectionString = 'mongodb://' + (dbUser ? (dbUser + ":" + dbPassword + "@") : "") + dbHost + ':' + dbPort + '/' + dbName;
    };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig) {
        if (typeof sig === "string") {
            console.log('%s: Received %s - terminating sample app ...',
                Date(Date.now()), sig);
            process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()));
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function() {
        //  Process on exit and signals.
        process.on('exit', function() {
            self.terminator();
        });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
            'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() {
                self.terminator(element);
            });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    self.setupRoutes = function(app, db) {
        // CORS headers
        app.all('/', function(req, res, next) {
          res.header("Access-Control-Allow-Origin", "*");
          res.header("Access-Control-Allow-Headers", "X-Requested-With");
          next();
         });        

        app.get('/', routes.index);
        app.get('/index.html', routes.index);
        app.get('/signup', routes.signupGet);
        
        // set up mailer routes
        require('./lib/routes/mailer.js')(app, db, '/mail');
    };

    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        //self.createRoutes();
        self.app = express(); //.createServer();

        // all environments
        self.app.set('port', process.env.OPENSHIFT_NODEJS_PORT || 8080);

        self.app.set('view options'); //, {layout:false});
        self.app.set('views', __dirname + '/views');
        self.app.set('view engine', 'js');
        self.app.engine('js', require('hbs').__express);

        self.app.set("view engine", "html");
        self.app.engine('html', require('hbs').__express);

        self.app.use(express.favicon());
        self.app.use(express.logger('dev'));
        //self.app.use(express.bodyParser());
        self.app.use(express.urlencoded());
        //self.app.use(express.methodOverride());
        self.app.use(express.cookieParser('your secret here'));
        self.app.use(express.session());
        self.app.use(self.app.router);
        //CORS headers for static files
        self.app.use(function(req, res, next) {
          res.header("Access-Control-Allow-Origin", "*");
          res.header("Access-Control-Allow-Headers", "X-Requested-With");
          next();
        });
        self.app.use(express.static(path.join(__dirname, 'public')));

        // development only
        if ('development' == self.app.get('env')) {
            self.app.use(express.errorHandler());
        }

        //  Add handlers for the app (from the routes).
        /*
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
        */
        self.db = null;
        console.log('Connection String: ' + self.connectionString);

        mongoClient.connect(self.connectionString,
            function(err, db) {
                if (err) throw err;
                self.db = db;
                self.setupRoutes(self.app, self.db);
            });
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        //self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.server = http.createServer(self.app);
        console.log('port:' + self.port + ', ip: ' + self.ipaddress);
        //self.io = socket.listen(self.server);
        self.server.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                Date(Date.now()), self.ipaddress, self.port);
        });
    };

}; /*  View Application.  */

/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();

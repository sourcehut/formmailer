var url = require("url");
var nconf = require('nconf');
var mailer = require('../formmailer/index.js');

module.exports = function session(app, db, route) {
    route = route || '/mail';
    app.post(route + '/:user/send', function(req, res) {
        var user = req.params['user'];
        var from = req.body.inputFrom;
        //var to = req.body.inputTo;
        var subject = req.body.inputSubject;
        var message = req.body.inputMessage;

        if (!user) {
            res.send(404, "User does not exist");
            return;
        }
        if (!from) {
            res.send(404, "From address is invalid");
            return;
        }
        /*if (!to) {
            res.send(404, "To address is invalid");
            return;
        }*/
        if (!subject && !message) {
            res.send(404, "Nothing to send");
            return;
        }
        var options = {
            from: from,
            subject: subject,
            text: message
        };
        mailer.send(options);
        res.render('confirm.html');
    });
    app.get(route + '/:user/send', function(req, res) {
        var user = req.params['user'];
        res.render('formmailer.html', {
            action: route + '/' + user + '/send'
        });
    });
};

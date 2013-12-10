var nodemailer = require("nodemailer");
var nconf = require('nconf');
nconf.file({file: './conf/config.json'});

function getAuth() {
	var user = nconf.get('mailer:user');
	var pass = nconf.get('mailer:password');
	return {user : user, pass : pass};
}

function formMailer() {
	var self = this;

	self.mailer = nodemailer.createTransport("SMTP", {
		service: "Mandrill",
		auth: getAuth()
	});
}

module.exports = new formMailer();


formMailer.prototype.send = function(options) {
	var self = this;
	return self.mailer.sendMail(options, function(error, response) {
        if (error) {
            console.log(error);
        } else {
            console.log("Message sent: " + response.message);
        }
        self.mailer.close();
    });
};


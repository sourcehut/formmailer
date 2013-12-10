var nodemailer = require("nodemailer");
var nconf = require('nconf');
nconf.file({
    file: './conf/config.json'
});

function formMailer() {
    var self = this;

    self.config = nconf.get('mailer');

    self.mailer = nodemailer.createTransport("SMTP", {
        service: self.config.service,
        auth: {
            user: self.config.user,
            pass: self.config.password
        }
    });
}

module.exports = new formMailer();


formMailer.prototype.send = function(options) {
    var self = this;
    if (!self.config || !self.config.to)
        return;
    options.to = self.config.to;
    return self.mailer.sendMail(options, function(error, response) {
        if (error) {
            console.log(error);
        } else {
            console.log("Message sent: " + response.message);
        }
        self.mailer.close();
    });
};

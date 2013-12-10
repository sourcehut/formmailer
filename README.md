FormMailer helps you power contact forms. FormMailer accepts an HTML form post and generates an email to your address. 

ForMailer works on OpenShift cloud right out of the box. Here is how to set up your own FormMailer servie.

Create an OpenShift account, if you do not already have one. 
Set up OpenShift Application
Login to your OpenShift account and create a new application.
Specify the FormMailer git url as the source git.

Configure Application
Using your favourite git client clone the OpenShift application's repository.
Edit the conf/config.json file.

{
	"mailer" : {
		"service": "",      // Set service to you email service. FormMailer supports Google, Mandrill and SendGrid.
	    "user": "",         // Set the login id for your email service.
	    "password": "",		// Set the api key or password for your email service.

	    "to": ""			// Set your email id which will receive the contact form emails.
	}
}

Save, commit and push.

You are done. Now you can use your FormMailer service to accept html form posts and send them by email to your email address. Use the address <your-application-url>/mail/formmailer/send in the action paramater of your html form tag.



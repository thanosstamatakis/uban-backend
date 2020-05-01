const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs-extra');
const path = require('path');

const config = require('~root/src/config');
const emailConstants = require('~constants/email');

const transporter = nodemailer.createTransport({
	service: config.emailService,
	auth: {
		user: config.emailUser,
		pass: config.emailPassword,
	},
});

const sendEmail = mailOptions => {
	return new Promise((resolve, reject) => {
		transporter.sendMail(mailOptions, (err, info) => {
			if (err) {
				reject(err);
			} else {
				resolve(info);
			}
		});
	});
};

const sendVerificationEmail = async (user, token) => {
	const source = fs.readFileSync(
		emailConstants.verificationEmail.getTemplatePath(),
		'utf8'
	);

	const template = handlebars.compile(source);

	const html = template({
		user,
		url: emailConstants.verificationEmail.getUrl(token),
	});

	const mailOptions = {
		from: emailConstants.from,
		to: user.email,
		subject: emailConstants.verificationEmail.subject,
		html,
	};

	try {
		await sendEmail(mailOptions);
	} catch (error) {
		config.getLogger('api/v1/users/sendVerificationEmail').error(error);
	}
};

const sendPasswordRecoveryEmail = async (user, token) => {
	const source = fs.readFileSync(
		emailConstants.resetPassword.getTemplatePath(),
		'utf8'
	);

	const template = handlebars.compile(source);

	const html = template({
		user,
		url: emailConstants.resetPassword.getUrl(token),
	});

	const mailOptions = {
		from: emailConstants.from,
		to: user.email,
		subject: emailConstants.resetPassword.subject,
		html,
	};

	try {
		await sendEmail(mailOptions);
	} catch (error) {
		config.getLogger('api/v1/users/resetPassword').error(error);
	}
};

module.exports = {
	sendEmail,
	sendVerificationEmail,
	sendPasswordRecoveryEmail,
};

const config = require('~root/src/config');
const path = require('path');

module.exports.from = 'uBan';

module.exports.verificationEmail = {
	subject: 'Email verification',
	getTemplatePath: () => {
		return path.join(config.templateFolder, 'emailVerification.handlebars');
	},
	getUrl: token => {
		const frontendUrl = config.getFrontendUrl();
		return `${frontendUrl}/verification/${token}`;
	},
};

module.exports.resetPassword = {
	subject: 'Password recovery',
	getTemplatePath: () => {
		return path.join(config.templateFolder, 'passwordRecovery.handlebars');
	},
	getUrl: token => {
		const frontendUrl = config.getFrontendUrl();
		return `${frontendUrl}/recovery/${token}`;
	},
};

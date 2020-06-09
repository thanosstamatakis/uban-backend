/**
    File containing main configuration class for node project.
 */

// JS libs.
const { createLogger, format, transports } = require('winston');
const yamlLib = require('js-yaml');
const fs = require('fs');
const path = require('path');
// Project files.

class Configuration {
	constructor() {
		this.env = process.env.NODE_ENV;
		if (this.env == 'production') {
			// console.log(process.env.NODE_ENV);
			this.frontendIp = process.env.FE_IP;
			this.frontendPort = Number(process.env.FE_PT);
			this.backendIp = process.env.BE_IP;
			this.backendPort = Number(process.env.BE_PT);
			this.databaseIp = process.env.DB_IP;
			this.databasePort = Number(process.env.DB_PT);
			this.databaseName = process.env.DB_NM;
			this.databaseUsername = process.env.DB_UNM;
			this.databaseUserPassword = process.env.DB_UPS;
			this.rootDir = __dirname.split('src')[0];
			// Templates configuration
			this.templateFolder = path.join(this.rootDir, 'src', 'templates');
			// Upload configuration
			this.uploadFolder = path.join(this.rootDir, 'uploads');
			this.downloadFolder = path.join(this.rootDir, 'downloads');
			this.defaultProfilePicPath = 'defaultProfilePic.png';
			this.defaultPostImagePath = 'defaultPostImage.jpeg';
			this.errorImagePath = 'errorImage.png';
			this.jwt_key = process.env.JWT;
			this.session = process.env.JWT_SESS;
			// Logging Configuration.
			this.loggingLevel = 'info';
			this.loggingFormat =
				'${info.label}|${info.timestamp}|${info.level}|${info.message}';
			this.loggingDateFormat = 'YYYY-MM-DD HH:mm:ss';
			this.loggingWarningFolder = 'logging/warning.log';
			this.loggingErrorFolder = 'logging/error.log';
			// Email configuration
			this.emailService = '';
			this.emailUser = '';
			this.emailPassword = '';
			// oAuth configuration
			this.googleClientKey = process.env.GOOGLE_API;
			this.githubClientKey = process.env.GITHUB_API;
			this.githubClientSecret = process.env.GITHUB_API_SECRET;
		} else {
			this.rootDir = __dirname.split('src')[0];
			this.yamlConfig = yamlLib.safeLoad(
				fs.readFileSync(path.join(this.rootDir, 'config', 'config.yaml'))
			);
			if (!this.yamlConfig) process.exit(1);
			// Backend Configuration.
			this.backendIp = this.yamlConfig[this.env]['backend']['ip'];
			this.backendPort = this.yamlConfig[this.env]['backend']['port'];
			// Frontend Configuration.
			this.frontendIp = this.yamlConfig[this.env]['frontend']['ip'];
			this.frontendPort = this.yamlConfig[this.env]['frontend']['port'];
			// Database Configuration.
			this.databaseIp = this.yamlConfig[this.env]['database']['ip'];
			this.databasePort = this.yamlConfig[this.env]['database']['port'];
			this.databaseName = this.yamlConfig[this.env]['database']['name'];
			this.databaseUsername = this.yamlConfig[this.env]['database']['username'];
			this.databaseUserPassword = this.yamlConfig[this.env]['database'][
				'password'
			];
			// Templates configuration
			this.templateFolder = path.join(this.rootDir, 'src', 'templates');
			// Upload configuration
			this.uploadFolder = path.join(this.rootDir, 'uploads');
			this.downloadFolder = path.join(this.rootDir, 'downloads');
			this.defaultProfilePicPath = 'defaultProfilePic.png';
			this.defaultPostImagePath = 'defaultPostImage.jpeg';
			this.errorImagePath = 'errorImage.png';
			// Authorization configutation
			this.jwt_key = this.yamlConfig[this.env]['authorization']['jwt-key'];
			this.session = this.yamlConfig[this.env]['authorization']['session'];
			// Logging Configuration.
			this.loggingLevel = this.yamlConfig[this.env]['logging']['level'];
			this.loggingFormat = this.yamlConfig[this.env]['logging']['format'];
			this.loggingDateFormat = this.yamlConfig[this.env]['logging'][
				'date-format'
			];
			this.loggingWarningFolder = this.yamlConfig[this.env]['logging'][
				'warning-folder'
			];
			this.loggingErrorFolder = this.yamlConfig[this.env]['logging'][
				'error-folder'
			];
			// Email configuration
			this.emailService = this.yamlConfig[this.env]['email']['service'];
			this.emailUser = this.yamlConfig[this.env]['email']['user'];
			this.emailPassword = this.yamlConfig[this.env]['email']['password'];
			// oAuth configuration
			this.googleClientKey = this.yamlConfig[this.env]['google-oauth'][
				'client-id'
			];
			this.githubClientKey = this.yamlConfig[this.env]['github-oauth'][
				'client-id'
			];
			this.githubClientSecret = this.yamlConfig[this.env]['github-oauth'][
				'client-secret'
			];
		}
	}

	getBackendUrl() {
		return `http://${this.backendIp}:${this.backendPort}`;
	}

	getFrontendUrl() {
		return `${this.frontendIp}:${this.frontendPort}`;
	}

	getDatabaseUrl() {
		return (
			'mongodb://' +
			this.databaseUsername +
			':' +
			this.databaseUserPassword +
			'@' +
			this.databaseIp +
			':' +
			this.databasePort +
			'/' +
			this.databaseName
		);
	}

	getLogger(route) {
		let logger = createLogger({
			level: this.loggingLevel,
			format: format.combine(
				format.label({ label: route }),
				format.timestamp({ format: this.loggingDateFormat }),
				format.printf((info) => eval('`' + this.loggingFormat + '`'))
			),
			transports: [
				new transports.Console(),
				new transports.File({
					filename: 'logging/combined.log',
				}),
			],
		});
		return logger;
	}
}

const config = new Configuration();

module.exports = config;

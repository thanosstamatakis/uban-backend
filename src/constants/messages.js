module.exports.error = {
	user: {
		emailNotVerified: 'Email has not been verified',
		emailExists: 'An account with that email already exists',
		invalidId: 'User does not exist',
		invalidEmail: 'No account with that email',
		incorectPassword: 'The given password is incorrect',
		insecurePassword: 'The given password is insecure',
	},
	auth: {
		authFailed: 'Authentication failed',
	},
};

module.exports.log = {
	getStartupLog: port => {
		return `Listening on port ${port}...`;
	},
};

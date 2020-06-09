/**
 * Authentication services
 */
const jwt = require('jsonwebtoken');
const config = require('../../../config');
const authMessages = require('../../../constants/messages').error.auth;

/**
 * Create a jsonwebtoken from email and id
 * @param {String} email
 * @param {String} id
 * @param {String} displayName
 * @param {String} profilePicture
 */
const sign = (email, id, displayName, profilePicture) => {
	const token = jwt.sign(
		{
			email,
			_id: id,
			displayName,
			profilePicture,
		},
		config.jwt_key,
		{ expiresIn: config.session.toString() }
	);

	return token;
};

/**
 * Verify a jsonwebtoken
 * @param {String} token
 */
const verify = (token) => {
	try {
		const decoded = jwt.verify(token, config.jwt_key);
		return decoded;
	} catch (error) {
		let err = new Error(authMessages.authFailed);
		err.status = 401;
		return err;
	}
};

/**
 * Verify a jsonwebtoken
 * @param {String} token
 */
const decode = (token) => {
	const decoded = jwt.decode(token);
	return decoded;
};

module.exports = {
	sign,
	verify,
	decode,
};

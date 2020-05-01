/**
 * Password services
 */

// Js libs
const bcrypt = require('bcryptjs');
const util = require('util');

// Promisified functions for ease of use
const genSalt = util.promisify(bcrypt.genSalt);
const hash = util.promisify(bcrypt.hash);
const comparePassword = util.promisify(bcrypt.compare);

const userMessages = require('~constants/messages').error.user;

/**
 * Hash a given password
 * @param {String} password
 */
const create = async password => {
	validate(password);
	const salt = await genSalt();
	const hashedPassword = hash(password, salt);
	return hashedPassword;
};

/**
 * Compare a password to a hash
 * @param {String} password1
 * @param {String} password2
 */
const compare = async (password1, password2) => {
	const correctPassword = await comparePassword(password1, password2);

	if (!correctPassword) {
		let error = new Error(userMessages.incorectPassword);
		error.status = 401;
		throw error;
	}
};

/**
 * Validate password length
 * @param {String} password
 */
const validate = password => {
	const hasNumber = /\d/;
	if (password.length < 8 || !hasNumber.test(password)) {
		throw new Error(userMessages.insecurePassword);
	}
};

module.exports = {
	create,
	genSalt,
	compare,
	validate,
};

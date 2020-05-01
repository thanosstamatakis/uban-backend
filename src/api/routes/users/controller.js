/**
 * User controller
 */

// Js libs
const mongoose = require('mongoose');

// Libs authored by team
const config = require('~root/src/config');

// Services
const userService = require('~services/user');
const passwordService = require('~services/password');
const authService = require('~services/authentication');
const emailService = require('~services/email');

// Constants
const emailConstants = require('~constants/email');
const userMessages = require('~constants/messages').error.user;

/**
 * Controller function that returns all the user entities
 */
module.exports.get_all_users = async (req, res, next) => {
	try {
		const users = await userService.getByQuery();

		return res.status(200).json(users);
	} catch (error) {
		next(error);
	}
};

/**
 * Controller function that returns a specific user entity
 */
module.exports.get_user_by_id = async (req, res, next) => {
	try {
		const user = await userService.getById(req.params.userId);

		return res.status(200).json(user);
	} catch (error) {
		next(error);
	}
};

/**
 * Controller function that creates a user entity
 */
module.exports.add_user = async (req, res, next) => {
	try {
		const { email, password } = req.body;

		let profilePicPath = config.defaultProfilePicPath;

		if (req.file) {
			profilePicPath = req.file.filename;
		}
		await userService.verifyEmail(email);

		const hashedPassword = await passwordService.create(password);

		let user = {
			_id: mongoose.Types.ObjectId(),
			email: email,
			verified: false,
			password: hashedPassword,
			displayName: req.body.displayName,
			roleName: req.body.roleName,
			profilePicture: profilePicPath,
		};

		const result = await userService.createUser(user);

		const token = authService.sign(result.email, result._id, result.roleName);

		emailService.sendVerificationEmail(result, token).then();

		let response = {
			user: {
				_id: result._id,
				email: result.email,
				displayName: result.displayName,
				roleName: result.roleName,
				profilePicture: result.profilePicture,
			},
			token,
		};

		res.status(201).json(response);
	} catch (error) {
		next(error);
	}
};

/**
 * Controller function that logs in a user by returning the user entity
 * and a json web token
 */
module.exports.login_user = async (req, res, next) => {
	try {
		const { email, password } = req.body;

		const user = await userService.verifyUserByEmail(email);

		await passwordService.compare(password, user.password);

		// Check if user email is verified
		if (!user.verified) {
			let error = new Error(userMessages.emailNotVerified);
			error.status = 401;
			throw error;
		}

		const token = authService.sign(user.email, user._id, user.roleName);

		res.status(200).json({ user, token });
	} catch (error) {
		next(error);
	}
};

/**
 * Controller function that updates a user entity
 */
module.exports.update_user = async (req, res, next) => {
	try {
		const id = req.params.userId;
		let updateOpts = req.body;
		// Check if passowrd is sent and delete it from update opts.
		// Password should not be updated from this function.
		if ('password' in updateOpts) {
			delete updateOpts['password'];
		}
		// Update user db entity.
		await userService.updateUser(id, updateOpts);
		
		res.sendStatus(200);
	} catch (error) {
		next(error);
	}
};

module.exports.update_password = async (req, res, next) => {
	try {
		const { password } = req.body;
		const token = req.params.userToken;
		// Verify User token and return user object.
		const verifiedUser = authService.verify(token);

		// Update user password.
		const hashedPassword = await passwordService.create(password);
		await userService.updateUser(verifiedUser._id, {
			password: hashedPassword,
		});

		// Return user token to log in user.
		const newToken = authService.sign(
			verifiedUser.email,
			verifiedUser._id,
			verifiedUser.roleName
		);

		// Response.
		res.status(200).json({ token: newToken });
	} catch (error) {
		next(error);
	}
};

module.exports.forgot_password = async (req, res, next) => {
	try {
		const { email } = req.params;
		const user = await userService.verifyUserByEmail(email);

		const token = authService.sign(user.email, user._id, user.roleName);

		emailService.sendPasswordRecoveryEmail(user, token).then();

		res.sendStatus(200);
	} catch (error) {
		next(error);
	}
};

module.exports.verify_email = async (req, res, next) => {
	try {
		const token = req.params.token;
		const decoded = authService.verify(token);
		let user, userToken;

		await userService.updateUser(decoded._id, { verified: true });

		user = await userService.getById(decoded._id);
		userToken = authService.sign(user.email, user._id);

		res.status(200).json({
			user: {
				_id: user._id,
				email: user.email,
				displayName: user.displayName,
				roleName: user.roleName,
				profilePicture: user.profilePicture,
			},
			token: userToken,
		});
	} catch (error) {
		next(error);
	}
};

module.exports.check_email = async (req, res, next) => {
	try {
		const { email } = req.body;

		await userService.verifyUserByEmail(email);

		res.sendStatus(200);
	} catch (error) {
		error.status = 401;
		next(error);
	}
};

module.exports.send_verification_email = async (req, res, next) => {
	try {
		const user = await userService.getById(req.params.userId);

		const token = authService.sign(user.email, user._id);

		res.sendStatus(200);

		await emailService.sendVerificationEmail(user, token);
	} catch (error) {
		next(error);
	}
};

module.exports.update_profile_pic = async (req, res, next) => {
	try {
		const id = req.params.userId;

		await userService.updateUser(id, { profilePicture: req.file.filename });
		res.sendStatus(200);
	} catch (error) {
		next(error);
	}
};

/**
 * Controller function that deletes a user entity
 */
module.exports.delete_user = async (req, res, next) => {
	try {
		const id = req.params.userId;
		await userService.deleteUser(id);

		res.sendStatus(200);
	} catch (error) {
		next(error);
	}
};

/**
 * Controller function that deletes all user entities.
 */
module.exports.delete_all_users = async (req, res, next) => {
	try {
		await userService.deleteAllUsers();

		res.sendStatus(200);
	} catch (error) {
		next(error);
	}
};

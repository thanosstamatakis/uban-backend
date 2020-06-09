/**
 * Google login controller
 */

// Js libs
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');
// Libs authored by team
const config = require('../../../config');

// Services
const userService = require('../../services/user');
const authService = require('../../services/authentication');

// Constants
const client = new OAuth2Client(config.googleClientKey);

/**
 * Controller function that implements a google login/register
 */
module.exports.googleStrategy = async (req, res, next) => {
	try {
		//
		const ticket = await client.verifyIdToken({
			idToken: req.headers.authorization,
			audience: config.googleClientKey,
		});

		const googleId = ticket.payload.sub;
		const googleEmail = ticket.payload.email;
		const googleEmailVerified = ticket.payload.email_verified;
		const googleDisplayName = ticket.payload.name;
		const googlePicture = ticket.payload.picture;
		const existingUserData = await userService.getByQuery({
			googleId: googleId,
		});
		const userExists = existingUserData.length > 0;
		let userData = {};
		let token = '';

		if (!userExists) {
			let googleUser = {
				_id: mongoose.Types.ObjectId(),
				email: googleEmail,
				verified: googleEmailVerified,
				displayName: googleDisplayName,
				roleName: 'google',
				profilePicture: googlePicture,
				googleId: googleId,
			};
			userData = await userService.createUser(googleUser);
			token = await authService.sign(
				googleUser.email,
				googleUser._id,
				googleUser.displayName,
				googleUser.profilePicture
			);
		} else {
			userData = existingUserData[0];
			token = await authService.sign(
				userData.email,
				userData._id,
				userData.displayName,
				userData.profilePicture
			);
		}
		return res.status(200).json({ userData, token });
	} catch (error) {
		next(error);
	}
};

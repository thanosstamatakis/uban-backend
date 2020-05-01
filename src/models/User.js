const mongoose = require('mongoose');

// Create the user model for mongoose
const userSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	verified: {
		type: Boolean,
		required: true,
		default: false,
	},
	email: {
		type: String,
		required: true,
		createIndexes: true,
		// Validate the email field with regex
		match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
	},
	displayName: { type: String, required: true },
	password: { type: String, required: false },
	googleId: { type: String, required: false },
	roleName: {
		type: String,
		required: true,
		enum: ['uban', 'google', 'facebook', 'twitter'],
	},
	profilePicture: {
		type: String,
		required: true,
	},
});

module.exports = mongoose.model('User', userSchema);

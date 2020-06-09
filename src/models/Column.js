const mongoose = require('mongoose');
const Card = require('./Card');

// Create the user model for mongoose
const columnSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	team: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Team',
		required: true,
	},
	name: { type: String, required: true },
	githubId: { type: String, required: false },
	githubProject: { type: String, required: false },
	cards: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Card',
			required: true,
		},
	],
});

module.exports = mongoose.model('Column', columnSchema);

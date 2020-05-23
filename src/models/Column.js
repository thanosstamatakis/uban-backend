const mongoose = require('mongoose');
const Card = require('~models/Card');

// Create the user model for mongoose
const columnSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	team: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Team',
		required: true,
	},
	name: { type: String, required: true },
	cards: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Card',
			required: true,
		},
	],
});

module.exports = mongoose.model('Column', columnSchema);

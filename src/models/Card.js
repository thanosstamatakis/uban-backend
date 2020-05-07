const mongoose = require('mongoose');

// Create the user model for mongoose
const cardSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	team: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Team',
		required: true,
	},
	name: { type: String, required: true },
});

module.exports = mongoose.model('Card', cardSchema);

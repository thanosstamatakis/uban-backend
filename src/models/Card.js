const mongoose = require('mongoose');

// Create the user model for mongoose
const cardSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	team: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Team',
		required: true,
	},
	githubId: { type: String, required: false },
	githubProject: { type: String, required: false },
	githubColumn: { type: String, required: false },
	name: { type: String, default: '' },
});

module.exports = mongoose.model('Card', cardSchema);

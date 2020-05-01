const mongoose = require('mongoose');

// Create the user model for mongoose
const teamSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: { type: String, required: true },
	description: { type: String, required: true },
	members: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
	],
	board: { type: Object, default: null },
});

module.exports = mongoose.model('Team', teamSchema);

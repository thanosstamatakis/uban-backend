const mongoose = require('mongoose');
// const Column = require('~models/Column');

// Create the user model for mongoose
const boardSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	team: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Team',
		required: true,
	},
	name: { type: String, required: true },
	githubId: { type: String, required: false },
	columns: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Column',
			required: true,
		},
	],
});

module.exports = mongoose.model('Board', boardSchema);

const mongoose = require('mongoose');
const Board = require('~models/Board');

// Create the team model for mongoose
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
	board: Board.schema,
});

module.exports = mongoose.model('Team', teamSchema);

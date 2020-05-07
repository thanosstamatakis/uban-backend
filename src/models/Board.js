const mongoose = require('mongoose');
const Column = require('~models/Column');

// Create the user model for mongoose
const boardSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	team: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Team',
		required: true,
	},
	name: { type: String, required: true },
	columns: [Column.schema],
});

module.exports = mongoose.model('Board', boardSchema);

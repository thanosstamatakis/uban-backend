const mongoose = require('mongoose');

// Create the user model for mongoose
const messageSchema = mongoose.Schema(
	{
		_id: mongoose.Schema.Types.ObjectId,
		team: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Team',
			required: true,
		},
		sender: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		body: { type: String, required: true },
		seenBy: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
				required: true,
			},
		],
	},
	{ versionKey: false }
);

module.exports = mongoose.model('Message', messageSchema);

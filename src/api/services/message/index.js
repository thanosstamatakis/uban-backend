const Message = require('../../../models/Message');

const getByQuery = async (query) => {
	const result = await Message.find(query).populate('sender').exec();
	return result;
};

const getAllMessages = async () => {
	const result = await Message.find().populate('team').exec();
	return result;
};

const getTeamMessages = async (teamId) => {
	const result = await Message.find({ team: teamId }).exec();
	return result;
};

const createMessage = async (message) => {
	const newMessage = new Message(message);
	let result = await newMessage.save();
	return result;
};

const updateReadMessages = async (userId, messages) => {
	const result = await Message.updateMany(
		{ _id: { $in: messages } },
		{ $addToSet: { seenBy: userId } }
	).exec();
	return result;
};

const getUnseenMessages = async (userId) => {
	const result = await Message.aggregate([
		{ $match: { seenBy: { $nin: [userId] } } },
		{ $group: { _id: '$team' } },
		{ $project: { team: '$_id', _id: 0 } },
		{
			$lookup: {
				from: 'teams',
				localField: 'team',
				foreignField: '_id',
				as: 'team',
			},
		},
	]).exec();
	return result;
};

module.exports = {
	getByQuery,
	getAllMessages,
	createMessage,
	getTeamMessages,
	updateReadMessages,
	getUnseenMessages,
};

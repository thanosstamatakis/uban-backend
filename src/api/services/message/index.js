const Message = require('~models/Message');

const getByQuery = async (query) => {
	const result = await Message.find(query).exec();
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
	const result = await newMessage.save();
	return result;
};

module.exports = {
	getByQuery,
	getAllMessages,
	createMessage,
	getTeamMessages,
};

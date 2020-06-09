const Card = require('../../../models/Card');

const getByQuery = async (query) => {
	const result = await Card.find(query)
		// .select({ password: 0 })
		.exec();
	return result;
};

const getAllCards = async () => {
	const result = await Card.find().populate('team').exec();
	return result;
};

const createCard = async (card) => {
	const newCard = new Card(card);
	const result = await newCard.save();
	return result;
};

const updateCard = async (id, updateOpts) => {
	await Card.updateOne({ _id: id }, { $set: updateOpts }).exec();
};

module.exports = {
	getByQuery,
	getAllCards,
	createCard,
	updateCard,
};

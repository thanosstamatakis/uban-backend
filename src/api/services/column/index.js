/**
 JS libs
 **/
const mongoose = require('mongoose');
/**
 Authored by team
 **/
const cardService = require('../card');
/**
 Database Models
 **/
const Column = require('../../../models/Column');

const getByQuery = async (query) => {
	const result = await Column.find(query)
		// .select({ password: 0 })
		.exec();
	return result;
};

const getAllColumns = async () => {
	const result = await Column.find().populate('cards').exec();
	return result;
};

const createColumn = async (column) => {
	const newColumn = new Column(column);
	const result = await newColumn.save();
	return result;
};

const createInitialColumn = async (column) => {
	// Instantiate card and add to column
	const card = {
		_id: mongoose.Types.ObjectId(),
		team: column.team,
		name: 'My first card',
	};
	const newCard = await cardService.createCard(card);
	column = { ...column, cards: [newCard._id] };

	// Create column & store to Mongo
	const newColumn = new Column(column);
	const result = await newColumn.save();
	return result;
};

const addCardToColumn = async (column, cardId) => {
	await Column.updateOne({ _id: column }, { $push: { cards: cardId } }).exec();
};

const updateColumn = async (id, updateOpts) => {
	await Column.updateOne({ _id: id }, { $set: updateOpts }).exec();
};

const updateCardIndex = async (cardId, columnId, newIndex) => {
	await Column.updateOne(
		{ _id: columnId },
		{
			$pull: {
				cards: cardId,
			},
		}
	);
	await Column.updateOne(
		{ _id: columnId },
		{
			$push: {
				cards: {
					$each: [cardId],
					$position: newIndex,
				},
			},
		}
	);
};

const updateCardColumn = async (cardId, columnId, prevColId, newIndex) => {
	await Column.updateOne(
		{ _id: prevColId },
		{
			$pull: {
				cards: cardId,
			},
		}
	);
	await Column.updateOne(
		{ _id: columnId },
		{
			$push: {
				cards: {
					$each: [cardId],
					$position: newIndex,
				},
			},
		}
	);
};

module.exports = {
	getByQuery,
	getAllColumns,
	createColumn,
	createInitialColumn,
	updateColumn,
	addCardToColumn,
	updateCardIndex,
	updateCardColumn,
};

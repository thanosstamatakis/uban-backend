/**
 JS libs
 **/
const mongoose = require('mongoose');
/**
 Authored by team
 **/
const cardService = require('~services/card');
/**
 Database Models
 **/
const Column = require('~models/Column');

const getByQuery = async (query) => {
	const result = await Column.find(query)
		// .select({ password: 0 })
		.exec();
	return result;
};

const getAllColumns = async () => {
	const result = await Column.find().populate('team').exec();
	return result;
};

const createColumn = async (column) => {
	const newColumn = new Column(column);
	const result = await newColumn.save();
	return result;
};

const createInitialColumn = async (column) => {
	const newColumn = new Column(column);
	const result = await newColumn.save(async (err, doc) => {
		if (err) console.error(err);

		let card = {
			_id: mongoose.Types.ObjectId(),
			team: newColumn.team,
			name: 'My first card',
		};

		await cardService.createCard(card);
	});
	return result;
};

const updateColumn = async (id, updateOpts) => {
	await Column.updateOne({ _id: id }, { $set: updateOpts }).exec();
};

module.exports = {
	getByQuery,
	getAllColumns,
	createColumn,
	createInitialColumn,
	updateColumn,
};

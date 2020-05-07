/**
 JS libs
 **/
const mongoose = require('mongoose');
/**
 Authored by team
 **/
const columnService = require('~services/column');
/**
 Database Models
 **/
const Board = require('~models/Board');

const getByQuery = async (query) => {
	const result = await Board.find(query)
		// .select({ password: 0 })
		.exec();
	return result;
};

const getAllBoards = async () => {
	const result = await Board.find().populate('team').exec();
	return result;
};

const createBoard = async (board) => {
	const newBoard = new Board(board);
	const result = await newBoard.save(async (err, doc) => {
		if (err) console.error(err);

		let column = {
			_id: mongoose.Types.ObjectId(),
			team: newBoard.team,
			name: 'My first column',
		};

		await columnService.createInitialColumn(column);
	});
	return result;
};

const updateBoard = async (id, updateOpts) => {
	await Board.updateOne({ _id: id }, { $set: updateOpts }).exec();
};

module.exports = {
	getByQuery,
	getAllBoards,
	createBoard,
	updateBoard,
};

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
	const result = await Board.find().populate('columns').exec();
	return result;
};

const createBoard = async (board) => {
	// Instantiate column and add to board
	let column = {
		_id: mongoose.Types.ObjectId(),
		team: board.team,
		name: 'My first column',
	};
	const newCol = await columnService.createInitialColumn(column);
	board = { ...board, columns: [newCol._id] };

	// Create board & store to Mongo
	const newBoard = new Board(board);
	const result = await newBoard.save();
	return result;
};

const createPreConfiguredBoard = async (board) => {
	// Create board & store to Mongo
	const newBoard = new Board(board);
	const result = await newBoard.save();
	return result;
};

const addColumnToBoard = async (teamId, columnId) => {
	await Board.updateOne(
		{ team: teamId },
		{ $push: { columns: columnId } }
	).exec();
};

const updateBoard = async (id, updateOpts) => {
	await Board.updateOne({ _id: id }, { $set: updateOpts }).exec();
};

module.exports = {
	getByQuery,
	getAllBoards,
	createBoard,
	updateBoard,
	addColumnToBoard,
	createPreConfiguredBoard,
};

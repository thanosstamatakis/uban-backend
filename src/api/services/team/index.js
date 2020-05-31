/**
	JS libs
**/
const mongoose = require('mongoose');
/**
	Authored by team
**/
const boardService = require('~services/board');
/**
	Database Models
**/
const Team = require('~models/Team');

const getByQuery = async (query) => {
	const result = await Team.find(query)
		.populate({
			path: 'board',
			select: {
				__v: 0,
				// team: 0,
			},
			populate: {
				path: 'columns',
				select: {
					__v: 0,
					// team: 0,
				},
				populate: {
					path: 'cards',
					select: {
						__v: 0,
						// team: 0,
					},
				},
			},
		})
		// .select({ password: 0 })
		.exec();
	return result;
};

const getAllTeams = async () => {
	const result = await Team.find().populate('members').exec();
	return result;
};

const createTeam = async (team) => {
	// Instantiate board and add to team
	let board = {
		_id: mongoose.Types.ObjectId(),
		team: team._id,
		name: team.name,
	};
	const newBoard = await boardService.createBoard(board);
	team = { ...team, board: newBoard._id };

	// Create team & store to Mongo
	const newTeam = new Team(team);
	const result = await newTeam.save();
	return result;
};

const createPreConfiguredTeam = async (team) => {
	// Create team & store to Mongo
	const newTeam = new Team(team);
	const result = await newTeam.save();
	return result;
};

const updateTeam = async (id, updateOpts) => {
	await Team.updateOne({ _id: id }, { $set: updateOpts }).exec();
};

module.exports = {
	getByQuery,
	getAllTeams,
	createTeam,
	updateTeam,
	createPreConfiguredTeam,
};

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
		// .select({ password: 0 })
		.exec();
	return result;
};

const getAllTeams = async () => {
	const result = await Team.find().populate('members').exec();
	return result;
};

const createTeam = async (team) => {
	const newTeam = new Team(team);
	const result = await newTeam.save(async (err, doc) => {
		if (err) console.error(err);

		let board = {
			_id: mongoose.Types.ObjectId(),
			team: newTeam._id,
			name: newTeam.name,
		};

		await boardService.createBoard(board);
	});
	return result;
};

// const author = new Person({
// 	_id: new mongoose.Types.ObjectId(),
// 	name: 'Ian Fleming',
// 	age: 50
//   });

//   author.save(function (err) {
// 	if (err) return handleError(err);

// 	const story1 = new Story({
// 	  title: 'Casino Royale',
// 	  author: author._id    // assign the _id from the person
// 	});

// 	story1.save(function (err) {
// 	  if (err) return handleError(err);
// 	  // that's it!
// 	});
//   });

const updateTeam = async (id, updateOpts) => {
	await Team.updateOne({ _id: id }, { $set: updateOpts }).exec();
};

module.exports = {
	getByQuery,
	getAllTeams,
	createTeam,
	updateTeam,
};

const Team = require('~models/Team');

const getByQuery = async query => {
	const result = await Team.find(query)
		// .select({ password: 0 })
		.exec();
	return result;
};

const getAllTeams = async () => {
	const result = await Team.find()
		.populate('members')
		.exec();
	return result;
};

const createTeam = async team => {
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
};

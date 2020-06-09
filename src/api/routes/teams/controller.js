/**
 * User controller
 */

// Js libs
const mongoose = require('mongoose');

// Libs authored by team
const config = require('../../../config');

// Services
const teamService = require('../../services/team');
const authService = require('../../services/authentication');

/**
 * Controller function that returns all the team entities
 */
module.exports.get_all_teams = async (req, res, next) => {
	try {
		const teams = await teamService.getAllTeams();

		return res.status(200).json(teams);
	} catch (error) {
		next(error);
	}
};

/**
 * Controller function that returns all the team entities
 */
module.exports.get_team_by_user = async (req, res, next) => {
	try {
		const token = req.headers.authorization.split(' ')[1];
		const decoded = await authService.decode(token);
		const teams = await teamService.getByQuery({ members: decoded._id });

		return res.status(200).json(teams);
	} catch (error) {
		next(error);
	}
};

/**
 * Controller function that adds a new team entity
 */
module.exports.add_new_team = async (req, res, next) => {
	try {
		// const users = await teamService.createTeam();
		const token = req.headers.authorization.split(' ')[1];
		const decoded = await authService.decode(token);
		const userId = decoded._id;
		const body = req.body;

		let team = {
			_id: mongoose.Types.ObjectId(),
			name: body.name,
			description: body.description,
			members: [userId, ...body.members],
		};

		const result = await teamService.createTeam(team);

		return res.status(200).json(result);
	} catch (error) {
		next(error);
	}
};

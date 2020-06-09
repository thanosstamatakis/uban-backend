/**
 * User controller
 */

// Js libs
const mongoose = require('mongoose');

// Libs authored by team
const config = require('../../../config');

// Services
const teamService = require('../../services/team');
const messageService = require('../../services/message');
const authService = require('../../services/authentication');

/**
 * Controller function that returns all the unread message entities
 */
module.exports.get_unread_messages = async (req, res, next) => {
	try {
		const userId = req.params.userId;
		const results = await messageService.getUnseenMessages(userId);
		return res.status(200).json(results);
	} catch (error) {
		next(error);
	}
};

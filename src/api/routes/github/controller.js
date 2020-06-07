/**
 * Google login controller
 */

// Js libs
const mongoose = require('mongoose');
const request = require('superagent');
let axios = require('axios');
// Libs authored by team
const config = require('~root/src/config');

// Services
const userService = require('~services/user');
const authService = require('~services/authentication');
const teamService = require('~services/team');
const boardService = require('~services/board');
const columnService = require('~services/column');
const cardService = require('~services/card');

/**
 * Controller function that implements a github login/register
 */
module.exports.githubStrategy = async (req, res, next) => {
	try {
		const code = req.query.code;
		const options = {
			headers: { Accept: 'application/json' },
		};

		let response = await axios.post(
			'https://github.com/login/oauth/access_token',
			{
				client_id: config.githubClientKey,
				client_secret: config.githubClientSecret,
				code: code,
			},
			options
		);

		const accessToken = response.data.access_token;

		// Get the users data
		axios.defaults.headers.common['Authorization'] = `token ${accessToken}`;
		let githubData = await axios.get('https://api.github.com/user');

		const githubId = githubData.data.login;
		const githubEmail = githubData.data.email;
		const githubDisplayName = githubData.data.name;
		const githubPicture = githubData.data.avatar_url;
		const existingUserData = await userService.getByQuery({
			githubId: githubId,
		});
		const userExists = existingUserData.length > 0;
		let userData = {};
		let token = '';

		// If user already exist sign his token and send it
		// Otherwise create user
		// ** ALWAYS UPDATES ACCESS TOKEN **
		if (!userExists) {
			let githubUser = {
				_id: mongoose.Types.ObjectId(),
				email: githubEmail,
				...(githubEmail && { githubEmail: githubEmail }),
				verified: true,
				displayName: githubDisplayName,
				roleName: 'github',
				profilePicture: githubPicture,
				githubAccessToken: accessToken,
				githubId: githubId,
			};
			userData = await userService.createUser(githubUser);
			token = await authService.sign(
				githubUser.email,
				githubUser._id,
				githubUser.displayName,
				githubUser.profilePicture
			);
		} else {
			userData = existingUserData[0];
			userService.updateUser(
				{ _id: userData._id },
				{ githubAccessToken: accessToken }
			);
			token = await authService.sign(
				userData.email,
				userData._id,
				userData.displayName,
				userData.profilePicture
			);
		}

		return res.status(200).json({ userData, token });
	} catch (error) {
		next(error);
	}
};

module.exports.get_user_projects = async (req, res, next) => {
	try {
		const token = req.headers.authorization.split(' ')[1];
		const decoded = await authService.decode(token);
		let results = [];

		let userData = await userService.getById(decoded._id);

		// Get all the github repos that the user owns
		axios.defaults.headers.common[
			'Authorization'
		] = `token ${userData.githubAccessToken}`;
		axios.defaults.headers.common[
			'Accept'
		] = `application/vnd.github.inertia-preview+json`;
		let githubRepos = await axios.get('https://api.github.com/user/repos');
		githubRepos = githubRepos.data
			.filter((repo) => repo.owner.login === userData.githubId)
			.map((repo) => {
				return {
					repoId: repo.id,
					repoName: repo.name,
					repoOwner: repo.owner.login,
					repoDescription: repo.description,
				};
			});

		let projects = [];
		for (const repo of githubRepos) {
			const project = await axios.get(
				`https://api.github.com/repos/${repo.repoOwner}/${repo.repoName}/projects`
			);
			if (project.data.length) {
				let team = {
					_id: mongoose.Types.ObjectId(),
					name: project.data[0].name,
					githubId: project.data[0].id,
					description: project.data[0].body,
					members: [userData._id],
				};

				let columns;
				let cards = [];
				columns = await axios.get(project.data[0].columns_url);
				columns = columns.data;

				for (const [i, column] of columns.entries()) {
					columns[i]['cards'] = [];
					let individualCards = await axios.get(column.cards_url);
					individualCards = individualCards.data.map((card) => {
						delete card.creator;
						const cardId = mongoose.Types.ObjectId();
						columns[i]['cards'] = [...columns[i]['cards'], cardId];
						return {
							_id: cardId,
							team: team._id,
							githubId: card.id,
							githubProject: team.githubId,
							githubColumn: column.id,
							name: card.note ? card.note : '',
						};
					});
					cards.push(...individualCards);
				}

				columns = columns.map((column) => {
					return {
						_id: mongoose.Types.ObjectId(),
						team: team._id,
						name: column.name,
						githubId: column.id,
						githubProject: team.githubId,
						cards: column.cards,
					};
				});

				const board = {
					_id: mongoose.Types.ObjectId(),
					name: project.data[0].name,
					githubId: project.data[0].id,
					team: team._id,
					columns: columns.map((column) => column._id),
				};

				team = { ...team, board: board._id };

				await teamService.createPreConfiguredTeam(team);
				await boardService.createPreConfiguredBoard(board);
				for (const column of columns) {
					await columnService.createColumn(column);
				}
				for (const card of cards) {
					await cardService.createCard(card);
				}
				results.push({ team, board, columns, cards });
			}
		}

		// for (const [index, project] of projects.entries()) {
		// 	const columns = await axios.get(project.columnsUrl);
		// 	projects[index]['columns'] = columns.data.map((column) => {
		// 		return {
		// 			id: column.id,
		// 			name: column.name,
		// 			cardsUrl: column.cards_url,
		// 		};
		// 	});
		// }

		return res.status(200).json(results);
	} catch (error) {
		next(error);
	}
};

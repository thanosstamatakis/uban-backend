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
		console.log(accessToken);

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
		// Get all the github repos that the user owns
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
		console.log(githubRepos);

		// https://api.github.com/repos/thanosstamatakis/uban-backend/projects

		let projects = [];
		for (const repo of githubRepos) {
			const project = await axios.get(
				`https://api.github.com/repos/${repo.repoOwner}/${repo.repoName}/projects`
			);
			if (project.data.length) {
				projects.push(project.data);
			}
		}

		console.log(projects);
		return res.status(200).json({ userData, token });
	} catch (error) {
		next(error);
	}
};

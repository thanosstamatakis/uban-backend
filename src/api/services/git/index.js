const axios = require('axios');
const userService = require('../user');

const updateCard = async (id, updateOpts, userId) => {
	try {
		let userGitAuth = await userService.getById(userId);
		userGitAuth = userGitAuth.githubAccessToken;

		const options = {
			headers: {
				Accept: 'application/vnd.github.inertia-preview+json',
				Authorization: `token ${userGitAuth}`,
			},
		};

		let response = await axios.patch(
			`https://api.github.com/projects/columns/cards/${id}`,
			updateOpts,
			options
		);
		return response.data;
	} catch (error) {
		console.error(error);
	}
};

const moveCard = async (id, updateOpts, userId) => {
	try {
		let userGitAuth = await userService.getById(userId);
		userGitAuth = userGitAuth.githubAccessToken;

		const options = {
			headers: {
				Accept: 'application/vnd.github.inertia-preview+json',
				Authorization: `token ${userGitAuth}`,
			},
		};

		let response = await axios.post(
			`https://api.github.com/projects/columns/cards/${id}/moves`,
			updateOpts,
			options
		);
		return response.data;
	} catch (error) {
		console.error(error);
	}
};

const createColumn = async (projectId, body, userId) => {
	try {
		let userGitAuth = await userService.getById(userId);
		userGitAuth = userGitAuth.githubAccessToken;

		const options = {
			headers: {
				Accept: 'application/vnd.github.inertia-preview+json',
				Authorization: `token ${userGitAuth}`,
			},
		};

		let response = await axios.post(
			`https://api.github.com/projects/${projectId}/columns`,
			body,
			options
		);
		return response.data;
	} catch (error) {
		console.error(error);
	}
};

const createCard = async (columnId, body, userId) => {
	try {
		let userGitAuth = await userService.getById(userId);
		userGitAuth = userGitAuth.githubAccessToken;

		const options = {
			headers: {
				Accept: 'application/vnd.github.inertia-preview+json',
				Authorization: `token ${userGitAuth}`,
			},
		};

		let response = await axios.post(
			`https://api.github.com/projects/columns/${columnId}/cards`,
			body,
			options
		);
		await moveCard(response.data.id, { position: 'bottom' }, userId);
		return response.data;
	} catch (error) {
		console.error(error);
	}
};

const updateColumn = async (id, updateOpts, userId) => {
	try {
		let userGitAuth = await userService.getById(userId);
		userGitAuth = userGitAuth.githubAccessToken;

		const options = {
			headers: {
				Accept: 'application/vnd.github.inertia-preview+json',
				Authorization: `token ${userGitAuth}`,
			},
		};

		let response = await axios.patch(
			`https://api.github.com/projects/columns/${id}`,
			updateOpts,
			options
		);
		return response.data;
	} catch (error) {
		console.error(error);
	}
};

module.exports = {
	updateCard,
	moveCard,
	createColumn,
	createCard,
	updateColumn,
};

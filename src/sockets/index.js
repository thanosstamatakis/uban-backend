const teamsService = require('~services/team');
const authService = require('~services/authentication');

/**
 * Main sockets index.
 */

module.exports.onConnection = (socket) => {
	socket.emit('test', 'Connection successfull');
	console.log('connection');

	socket.on('teamConnection', (teamId, data) => {
		socket.join(teamId);
		// try {
		// 	const tokenIsValid = authService.verify(data.token);
		// 	const team = await teamsService.getByQuery({ _id: teamId });
		// 	socket.emit('teamData', team[0]);
		// 	console.log(team[0]._id);
		// } catch (error) {
		// 	console.log(error);
		// }
		socket.to('5e80b69a6344df83c48846d1').emit('message', 'Iuagisduhia');
	});
	socket.on('message', (teamId, message) => {
		console.log('From message', teamId);
		console.log('went to messages');
		socket.to(teamId).emit('message', message);
	});
};

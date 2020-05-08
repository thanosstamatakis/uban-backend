const teamsService = require('~services/team');
const authService = require('~services/authentication');

/**
 * Main sockets index.
 */

module.exports.onConnection = (socket) => {
	console.info(`Client connected [id=${socket.id}]`);
	let sequenceNumberByClient = new Map();
	// socket.id.emit('message', 'Hey dude');
	// initialize this client's sequence number
	sequenceNumberByClient.set(socket, 1);
	// when socket disconnects, remove it from the list:
	socket.on('disconnect', () => {
		sequenceNumberByClient.delete(socket);
		console.info(`Client gone [id=${socket.id}]`);
	});

	socket.on('join', async ({ room }) => {
		let team = await teamsService.getByQuery({ _id: room });
		console.log(team[0]);
		// socket.emit('board', team[0].board);
		socket.join(room, () => {
			let rooms = Object.keys(socket.rooms);
			// console.log(rooms);
			socket.to(room).emit('message', 'a new user has joined the room');
		});
	});

	socket.on('message', ({ room, message }) => {
		console.log(room, message);
		socket.to(room).emit('message', message);
	});
};

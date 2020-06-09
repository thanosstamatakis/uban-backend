const mongoose = require('mongoose');

const teamsService = require('../api/services/team');
const authService = require('../api/services/authentication');
const boardService = require('../api/services/board');
const columnService = require('../api/services/column');

/**
 * Main sockets index.
 */

module.exports.onConnection = (socket) => {
	// console.info(`Client connected [id=${socket.id}]`);
	let sequenceNumberByClient = new Map();
	// socket.id.emit('message', 'Hey dude');
	// initialize this client's sequence number
	sequenceNumberByClient.set(socket, 1);
	// when socket disconnects, remove it from the list:
	socket.on('disconnect', () => {
		sequenceNumberByClient.delete(socket);
		// console.info(`Client gone [id=${socket.id}]`);
	});

	socket.on('join', async ({ room }) => {
		let team = await teamsService.getByQuery({ _id: room });
		socket.emit('board', team[0]);
		socket.join(room, () => {
			let rooms = Object.keys(socket.rooms);
			socket.to(room).emit('message', 'a new user has joined the room');
		});
	});

	socket.on('addColumn', async ({ room, columnName }) => {
		try {
			let column = {
				_id: mongoose.Types.ObjectId(),
				team: room,
				name: columnName,
				cards: [],
			};
			const columnResult = await columnService.createColumn(column);
			await boardService.addColumnToBoard(columnResult.team, columnResult._id);
			const team = await teamsService.getByQuery({ _id: room });
			socket.to(room).emit('board', team[0]);
		} catch (error) {
			console.error(error);
		}
	});

	socket.on('message', ({ room, message }) => {
		socket.to(room).emit('message', message);
	});
};

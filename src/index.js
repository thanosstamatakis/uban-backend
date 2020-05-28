/**
 * Main Server Module.
 */
// JS Libs.
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const yaml = require('yamljs');
const swaggerUi = require('swagger-ui-express');

// Project files.
const config = require('./config');
const logMessages = require('~constants/messages').log;
const ApiRouter = require('./api');

const logger = config.getLogger('/api/v1');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, { pingInterval: 10000 });
const socketHandler = require('~sockets/');
const swaggerDocument = yaml.load('./src/swagger.yaml');

// Connect to database
mongoose.connect(
	config.getDatabaseUrl(),
	{
		useNewUrlParser: true,
	},
	(err) => {
		if (err) logger.error(err);
	}
);
mongoose.Promise = global.Promise;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/api/v1', ApiRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// If request doesn't get handled by the routers above
// throw error
app.use((error, req, res, next) => {
	// Log the error and the route was thrown
	config.getLogger(req.originalUrl).error(error);
	next(error);
});

app.use((error, req, res, next) => {
	res.status(error.status || 500);
	res.json({
		error: {
			message: error.message,
		},
	});
});

// Port
const port = config.backendPort;
server.listen(port, () => logger.info(logMessages.getStartupLog(port)));

const teamsService = require('~services/team');
const authService = require('~services/authentication');
const userService = require('~services/user');
const boardService = require('~services/board');
const columnService = require('~services/column');
const cardService = require('~services/card');
const messageService = require('~services/message');
// Sockets
// io.on('connection', socketHandler.onConnection);
io.on('connection', (socket) => {
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
		socket.emit('board', team[0]);
		const messages = await messageService.getByQuery({ team: room });
		socket.emit('messages', messages);
		socket.join(room, () => {
			let rooms = Object.keys(socket.rooms);
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
			io.in(room).emit('board', team[0]);
		} catch (error) {
			console.error(error);
		}
	});

	socket.on('addCard', async ({ room, columnId }) => {
		try {
			console.log('room:', room);
			console.log('column:', columnId);
			let card = {
				_id: mongoose.Types.ObjectId(),
				team: room,
				name: 'New card',
			};
			const cardResult = await cardService.createCard(card);
			await columnService.addCardToColumn(columnId, cardResult._id);
			const team = await teamsService.getByQuery({ _id: room });
			io.in(room).emit('board', team[0]);
		} catch (error) {
			console.error(error);
		}
	});

	socket.on('changeCardName', async ({ room, cardId, name, columnId }) => {
		try {
			console.log(room);
			await cardService.updateCard(cardId, { name: name });
			let newCard = await cardService.getByQuery({ _id: cardId });
			newCard = JSON.stringify(newCard[0]);
			newCard = JSON.parse(newCard);
			socket.to(room).emit('cardUpdated', { ...newCard, columnId: columnId });
		} catch (error) {
			console.error(error);
		}
	});

	socket.on('changeColumnName', async ({ room, columnId, name }) => {
		try {
			console.log(room);
			await columnService.updateColumn(columnId, { name: name });
			const newColumn = await columnService.getByQuery({ _id: columnId });
			socket.to(room).emit('columnUpdated', newColumn[0]);
		} catch (error) {
			console.error(error);
		}
	});

	socket.on(
		'changeCardIndex',
		async ({ room, cardId, columnId, oldIndex, newIndex }) => {
			try {
				await columnService.updateCardIndex(cardId, columnId, newIndex);
				socket
					.to(room)
					.emit('cardIndexChanged', { columnId, oldIndex, newIndex });
			} catch (error) {
				console.error(error);
			}
		}
	);

	socket.on(
		'transferCard',
		async ({ room, cardId, columnId, prevColId, oldIndex, newIndex }) => {
			try {
				await columnService.updateCardColumn(
					cardId,
					columnId,
					prevColId,
					newIndex
				);
				socket.to(room).emit('cardPositionChanged', {
					columnId,
					prevColId,
					oldIndex,
					newIndex,
				});
			} catch (error) {
				console.error(error);
			}
		}
	);

	socket.on('message', async ({ room, sender, body }) => {
		try {
			const user = await userService.getByQuery({ _id: sender });
			let message = {
				_id: mongoose.Types.ObjectId(),
				team: room,
				sender: sender,
				body: body,
				seenBy: [sender],
			};
			const savedMessage = await messageService.createMessage(message);
			console.log('New message', savedMessage);
			io.in(room).emit('message', savedMessage);
		} catch (error) {
			console.error(error);
		}
	});
});

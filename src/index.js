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
const logMessages = require('./constants/messages').log;
const ApiRouter = require('./api');

const logger = config.getLogger('/api/v1');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, { pingInterval: 10000 });
const socketHandler = require('./sockets');
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

const teamsService = require('./api/services/team');
const authService = require('./api/services/authentication');
const userService = require('./api/services/user');
const boardService = require('./api/services/board');
const columnService = require('./api/services/column');
const cardService = require('./api/services/card');
const gitService = require('./api/services/git');
const messageService = require('./api/services/message');
// Sockets
// io.on('connection', socketHandler.onConnection);
io.on('connection', (socket) => {
	// console.info(`Client connected [id=${socket.id}]`);
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

	socket.on(
		'addColumn',
		async ({ room, columnName, git, gitProject, userId }) => {
			try {
				let gitColId;
				if (git) {
					let res = await gitService.createColumn(
						gitProject,
						{ name: columnName },
						userId
					);
					gitColId = res.id;
				}
				let column = {
					_id: mongoose.Types.ObjectId(),
					team: room,
					name: columnName,
					...(git && { githubId: gitColId }),
					...(git && { githubProject: gitProject }),
					cards: [],
				};
				const columnResult = await columnService.createColumn(column);
				await boardService.addColumnToBoard(
					columnResult.team,
					columnResult._id
				);
				const team = await teamsService.getByQuery({ _id: room });
				io.in(room).emit('board', team[0]);
			} catch (error) {
				console.error(error);
			}
		}
	);

	socket.on(
		'addCard',
		async ({ room, columnId, githubColumnId, git, userId, gitProject }) => {
			try {
				let gitCardId;
				if (git) {
					let res = await gitService.createCard(
						githubColumnId,
						{ note: 'New Card' },
						userId
					);
					gitCardId = res.id;
				}
				let card = {
					_id: mongoose.Types.ObjectId(),
					team: room,
					name: 'New card',
					...(git && { githubId: gitCardId }),
					...(git && { githubProject: gitProject }),
				};
				const cardResult = await cardService.createCard(card);
				await columnService.addCardToColumn(columnId, cardResult._id);
				const team = await teamsService.getByQuery({ _id: room });
				io.in(room).emit('board', team[0]);
			} catch (error) {
				console.error(error);
			}
		}
	);

	socket.on(
		'changeCardName',
		async ({ room, cardId, name, columnId, git, githubId, userId }) => {
			try {
				if (git) await gitService.updateCard(githubId, { note: name }, userId);
				await cardService.updateCard(cardId, { name: name });
				let newCard = await cardService.getByQuery({ _id: cardId });
				newCard = JSON.stringify(newCard[0]);
				newCard = JSON.parse(newCard);
				socket.to(room).emit('cardUpdated', { ...newCard, columnId: columnId });
			} catch (error) {
				console.error(error);
			}
		}
	);

	socket.on(
		'changeColumnName',
		async ({ room, columnId, name, git, githubId, userId }) => {
			try {
				if (git)
					await gitService.updateColumn(githubId, { name: name }, userId);
				await columnService.updateColumn(columnId, { name: name });
				const newColumn = await columnService.getByQuery({ _id: columnId });
				socket.to(room).emit('columnUpdated', newColumn[0]);
			} catch (error) {
				console.error(error);
			}
		}
	);

	socket.on(
		'changeCardIndex',
		async ({
			room,
			cardId,
			columnId,
			oldIndex,
			newIndex,
			position,
			githubId,
			git,
			userId,
		}) => {
			try {
				if (git)
					await gitService.moveCard(githubId, { position: position }, userId);
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
		async ({
			room,
			cardId,
			columnId,
			prevColId,
			oldIndex,
			newIndex,
			githubColumn,
			githubId,
			position,
			git,
			userId,
		}) => {
			try {
				if (git)
					await gitService.moveCard(
						githubId,
						{ position: position, column_id: parseInt(githubColumn) },
						userId
					);
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
				profilePicture: '',
			};
			const savedMessage = await messageService.createMessage(message);
			savedMessage.sender = user[0];
			io.in(room).emit('message', savedMessage);
		} catch (error) {
			console.error(error);
		}
	});

	socket.on('updateMessageViews', async ({ room, userId, messages }) => {
		try {
			const res = await messageService.updateReadMessages(userId, messages);
			const chatmessages = await messageService.getByQuery({ team: room });
			socket.emit('messages', chatmessages);
		} catch (error) {
			console.error(error);
		}
	});
});

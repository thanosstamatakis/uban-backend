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

// Sockets
// io.on('connection', socketHandler.onConnection);
io.on('connection', (socket) => {
	socket.on('join', ({ room }) => {
		console.log(room);
		console.log(`User connected to ${room}`);
		socket.join(room, () => {
			let rooms = Object.keys(socket.rooms);
			console.log(rooms);
			socket.to(room).emit('message', 'a new user has joined the room');
		});
	});

	socket.on('message', ({ room, message }) => {
		console.log(room, message);
		socket.to(room).emit('message', message);
	});
});

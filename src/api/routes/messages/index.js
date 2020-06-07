const multer = require('multer');

const router = require('express').Router();
const controller = require('./controller');
const checkAuth = require('~middleware/check-auth');
const config = require('~root/src/config');

router.get('/unread/:userId', checkAuth, controller.get_unread_messages);

module.exports = router;

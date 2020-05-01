const multer = require('multer');

const router = require('express').Router();
const controller = require('./controller');
const checkAuth = require('~middleware/check-auth');
const config = require('~root/src/config');


router.get('/all', checkAuth, controller.get_all_teams);

router.post('/', checkAuth, controller.add_new_team);

module.exports = router;

const router = require('express').Router();
const controller = require('./controller');
const checkAuth = require('~middleware/check-auth');

router.get('/auth', controller.githubStrategy);

router.get('/user-projects', checkAuth, controller.get_user_projects);

module.exports = router;

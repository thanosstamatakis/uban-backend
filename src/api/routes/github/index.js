const router = require('express').Router();
const controller = require('./controller');

router.get('/auth', controller.githubStrategy);

router.get('/user-projects', controller.get_user_projects);

module.exports = router;

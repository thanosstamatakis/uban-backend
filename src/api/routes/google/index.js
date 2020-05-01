const router = require('express').Router();
const controller = require('./controller');


router.get('/auth', controller.googleStrategy);

module.exports = router;

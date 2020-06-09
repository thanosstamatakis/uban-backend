const router = require('express').Router();

const checkAuth = require('../../middleware/check-auth');

const authService = require('../../services/authentication');

router.get('/', checkAuth, (req, res, next) => {
	const token = req.headers.authorization.split(' ')[1];
	const userData = authService.decode(token);
	res.status(200).json({
		valid: true,
		userData: userData,
	});
});

module.exports = router;

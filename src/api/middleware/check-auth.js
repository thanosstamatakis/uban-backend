const jwt = require('jsonwebtoken');
const config = require('~root/src/config');
const logger = config.getLogger('middleware');
/**
 * Middleware that validates a json web token stored as a cookie
 * in the request
 */
module.exports = (req, res, next) => {
	try {
		// Get the token from authorization header: Bearer <token>
		const token = req.headers.authorization.split(" ")[1];
		const decoded = jwt.verify(token, config.jwt_key);

		next();
	} catch (error) {
		return res.status(401).json({
			error,
			valid: false,
		});
	}
};

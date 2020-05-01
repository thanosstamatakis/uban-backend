const path = require('path');

const router = require('express').Router();

const config = require('~root/src/config');

router.get('/:filename', (req, res, next) => {
	const { filename } = req.params;
	res.sendFile(path.join(config.uploadFolder, filename), err => {
		if (err) {
			res.sendFile(path.join(config.uploadFolder, config.errorImagePath));
		}
	});
});

module.exports = router;

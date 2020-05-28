const multer = require('multer');

const router = require('express').Router();
const controller = require('./controller');
const checkAuth = require('~middleware/check-auth');
const config = require('~root/src/config');

// Set the location and name settings for files uploaded
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, config.uploadFolder);
	},
	filename: (req, file, cb) => {
		cb(null, new Date().toISOString() + file.originalname);
	},
});

// Only accept excel files
const fileFilter = (req, file, cb) => {
	if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
		// Accept a file
		cb(null, true);
	} else {
		// Reject a file
		cb(null, false);
	}
};

// Set upload limit to 5mb
const upload = multer({
	storage: storage,
	limits: {
		fileSize: 1024 * 1024 * 5,
	},
	fileFilter: fileFilter,
});

router.get('/all', checkAuth, controller.get_all_users);

router.get('/name', checkAuth, controller.get_user_by_name);

router.get('/:userId', checkAuth, controller.get_user_by_id);

router.get('/resetPassword/:email', controller.forgot_password);

router.get('/verifyEmail/:token', controller.verify_email);

router.get(
	'/sendVerificationEmail/:userId',
	controller.send_verification_email
);

router.post('/checkEmail', controller.check_email);

router.post('/login', controller.login_user);

router.post('/register', upload.single('profilePicture'), controller.add_user);

router.put('/:userId', checkAuth, controller.update_user);

router.put(
	'/profilePicture/:userId',
	checkAuth,
	upload.single('profilePicture'),
	controller.update_profile_pic
);

router.put('/password/:userToken', controller.update_password);

router.delete('/all', checkAuth, controller.delete_all_users);

router.delete('/:userId', checkAuth, controller.delete_user);

module.exports = router;

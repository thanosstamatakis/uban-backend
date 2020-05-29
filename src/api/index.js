/**
 * Main api router.
 */

const express = require('express');
const router = express.Router();

const userRouter = require('~routes/users');
const tokenVerificationRouter = require('~routes/verify-token');
const uploadRouter = require('~routes/uploads');
const googleRouter = require('~routes/google');
const githubRouter = require('~routes/github');
const teamsRouter = require('~routes/teams');

router.use('/users', userRouter);
router.use('/uploads', uploadRouter);
router.use('/google', googleRouter);
router.use('/github', githubRouter);
router.use('/teams', teamsRouter);
router.use('/verify-token', tokenVerificationRouter);

module.exports = router;

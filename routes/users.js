const express = require('express');
const router = express.Router({ mergeParams: true }); //allows us ot get params from mounted route
const passport = require('passport');
const { storeReturnTo } = require('../middleware');


const wrapAsync = require('../helpers/WrapAsync.js');
const User = require('../models/user.js');
const UsersController = require('../controllers/users.js');

//const { reviewSchema } = require('../schemas.js');

router.get('/register', UsersController.renderRegister);

router.post('/register', wrapAsync(UsersController.registerUser));

//get /login
router.get('/login', UsersController.renderLogin);

//post /login
router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), UsersController.userLogin);

router.get('/logout', UsersController.userLogout);

//create both routes and fill them out, create associated ejs files

module.exports = router;
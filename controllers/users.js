const express = require('express');
const router = express.Router({ mergeParams: true }); //allows us ot get params from mounted route
const passport = require('passport');
const { storeReturnTo } = require('../middleware');


const User = require('../models/user.js');

module.exports.renderRegister = (req, res) => {
    res.render('users/register.ejs'); //file location for ejs file
}

module.exports.registerUser = async (req, res, next) => {
    try {
        const { username, email, password } = req.body; //get fields for new user from form
        //create a new user, omit password, handled by passport
        const user = new User({ username, email });
        //takes password and stores the hashed results on our user
        const registeredUser = await User.register(user, password);

        req.login(registeredUser, err => {
            if (err) return next(err);
            //console.log(registeredUser);
            req.flash("success", "Your profile has been made, welcome to Cafe Hop");
            res.redirect("/cafes/search")
        })


    } catch (e) {
        //console.log("error message ", e.message); //writes correctly to terminal 
        req.flash("error", e.message);
        res.redirect('/register');
    }

}

module.exports.renderLogin = (req, res) => {
    res.render('users/login.ejs'); //file location for ejs file
}

module.exports.userLogin = (req, res) => {
    req.flash('success', "welcome back! :)");
    const redirectUrl = res.locals.returnTo || '/cafes';
    //we clear the url user was at once they have been redirected
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.userLogout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/cafes');
    });
}
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose')
const methodOverride = require('method-override');
const Cafe = require('./models/cafe.js');
const Review = require('./models/review.js');
const ejsMateEngine = require('ejs-mate'); //use this to create layouts
const wrapAsync = require('./helpers/WrapAsync.js');
const ExpressError = require('./helpers/ExpressError.js');
const session = require('express-session');
const flash = require('connect-flash');
const { cafeSchema, reviewSchema } = require('./schemas.js');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');
const mongoSanitize = require('express-mongo-sanitize');
const MongoDBStore = require('connect-mongo')(session);
const databaseURL = process.env.DB_URL
//const databaseURL = 'mongodb://localhost:27017/cafeHop';

const app = express();
//Any app.use middleware without a path defined is available to all for all requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine('ejs', ejsMateEngine);
app.set('view engine', 'ejs'); //set ejs directory
app.set('views', path.join(__dirname, 'views')) //set up views directory
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(mongoSanitize()); //doesn't allow keys with dollar sign or period for security reasons


const store = new MongoDBStore({
    url: databaseURL,
    secret: process.env.SECRET,
    touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, //wont show cookies to a third party
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //expires 1 week from now in miliseconds
        maxAge: 1000 * 60 * 60 * 24 * 7 //the longest the cookie can stay is 1 week
    }
}

app.use(session(sessionConfig));
app.use(flash());

//The following allows the session to be saved 
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate())); //uses user schema to authenticate

//how to store and unstore a user during a session:
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//The following middleware will give all routes access to 
//flash message without having to pass it in res.render
app.use((req, res, next) => {
    //any attributes in res.locals is available to all templates when we call res.render
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success'); //will be called as 'success'
    res.locals.error = req.flash('error');
    next();
});


const cafeRoutes = require('./routes/cafes.js');
app.use('/cafes', cafeRoutes); //mount all cafe pages to this route
const reviewRoutes = require('./routes/reviews.js');
app.use('/cafes/:id/reviews', reviewRoutes); //mount all review pages to this route
const userRoutes = require('./routes/users.js');
app.use('/', userRoutes);
app.use(express.static(path.join(__dirname, 'public')));

/*mongoose.connect(databaseURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}); */ //Not supported
mongoose.connect(databaseURL);

const db = mongoose.connection;
db.on("error", err => console.error("Connection error:", err));
db.once("open", () => console.log("Database connected"));

app.get('/', (req, res) => {
    //res.render('home.ejs') //this is what is being sent to route specified above
    res.redirect('/cafes/search');
})


//404 error handler
app.all(/(.*)/, (req, res, next) => { //I.e. all routes that don't match the above routes
    //res.send("404!");
    next(new ExpressError('uh oh page not found', 404)); //create a new express error
})


//Error handler (error objects are sent here!)
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Rip something broke :(" } = err; //set status and msg
    //.status(statusCode) sends response
    res.status(statusCode).render("errorAlert.ejs", { err }); //Show error page and send error info to the page
})

app.listen(8080, () => {
    console.log('serving on port 8080')
})



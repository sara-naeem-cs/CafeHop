const express = require('express');
const router = express.Router();
const { isLoggedIn, validateCafe, verifyAuthor } = require('../middleware.js');

const wrapAsync = require('../helpers/WrapAsync.js');
const ExpressError = require('../helpers/ExpressError.js');
const Cafe = require('../models/cafe.js');
const { cafeSchema } = require('../schemas.js');

const multer = require('multer');
const { storage } = require('../cloudinary'); //automatically looks for our index.js file
const upload = multer({ storage }); //replaced with cloudinary

const CafeController = require('../controllers/cafes.js')

router.get('/', wrapAsync(CafeController.index))

router.post('/', isLoggedIn, upload.single('image'), validateCafe, wrapAsync(CafeController.createNewCafe));

router.get('/search', wrapAsync(CafeController.search));

router.get('/autocompleteName', CafeController.autocompleteName);

//Show the new form page at this link
router.get('/new', isLoggedIn, CafeController.renderNewCafeForm);

//route will be triggered when a form submits data to /cafes using the POST method
// TEMP router.post('/', isLoggedIn, validateCafe, wrapAsync(CafeController.createNewCafe))

router.get('/:id', wrapAsync(CafeController.showCafe))

router.get('/:id/edit', isLoggedIn, verifyAuthor, wrapAsync(CafeController.renderEditCafeForm))

//Upload attribute name needs to match form name attribute
router.put('/:id', isLoggedIn, verifyAuthor, upload.single('image'), validateCafe, wrapAsync(CafeController.editCafe))

router.delete('/:id', verifyAuthor, isLoggedIn, wrapAsync(CafeController.deleteCafe))


module.exports = router;
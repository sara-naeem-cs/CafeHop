const Cafe = require('../models/cafe.js');
const { cloudinary } = require('../cloudinary/index.js');
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

const priceFormOptions = {
    "Not specified": "",
    "$": "$",
    "$$": "$$",
    "$$$": "$$$"
};

// Seating options map
const seatingFormOptions = {
    "Not specified": "",
    "Pick Up Only": "pickup_only",
    "Limited": "limited",
    "Ample": "lots",
};

const priceDisplayOptions = {
    "": "Not specified",
    "$": "$",
    "$$": "$$",
    "$$$": "$$$"
};

const seatingDisplayOptions = {
    "": "Not specified",
    "pickup_only": "Pick Up Only",
    "limited": "Limited",
    "lots": "Ample"
};

const wifiDisplayOptions = {
    true: "Yes",
    false: "No"
};

module.exports.index = async (req, res) => { //Here we list the address
    //The page willl load all cafes in order if query is not specified
    const searchName = req.query.search?.name || '';
    let cafes;

    if (searchName.trim() === '') {
        //Show all cafes if the search is empty
        cafes = await Cafe.find({}).sort({ title: 1 });
        //res.render('cafes/index.ejs', { cafes })
    } else {
        cafes = await Cafe.find({
            title: { $regex: searchName, $options: 'i' }
        }).sort({ title: 1 });
        //res.render('cafes/index.ejs', { cafes })
    }


    //const cafes = await Cafe.find({}).sort({ title: 1 });
    res.render('cafes/index.ejs', { cafes, priceDisplayOptions, seatingDisplayOptions, wifiDisplayOptions })
};

module.exports.autocompleteName = async (req, res) => {
    const { q } = req.query;

    // if empty then return an empty list
    if (!q || q.trim() === '') {
        return res.json([]);
    }

    //Find cafes that match partial text given by user
    const cafes = await Cafe.find({
        title: { $regex: q, $options: 'i' }
    })
        .limit(6)
        .select('title _id')
        .lean();
    //console.log(cafes);

    res.json(cafes);

};


module.exports.renderNewCafeForm = (req, res) => {
    // Price options map: label -> value

    res.render('cafes/new.ejs', { priceFormOptions, seatingFormOptions }); //shows the form
}

module.exports.createNewCafe = async (req, res, next) => {
    //if (!req.body.cafe) throw new ExpressError('Invalid cafe data', 400);
    //req.files.map(f => {url: f.path, f.filename}); // We get an array with url and file name
    const geoData = await maptilerClient.geocoding.forward(req.body.cafe.location, { limit: 1 }); //limit results to the first best match
    //console.log(geoData);
    if (!geoData.features?.length) { //if object exists, further access property
        req.flash('error', 'Could not geocode that location. Please try again and enter a valid location');
        return res.redirect('/cafes/new');
    }

    const cafe = new Cafe(req.body.cafe);

    cafe.geometry = geoData.features[0].geometry;
    cafe.location = geoData.features[0].place_name;

    //Set default image if one is not uploaded
    if (!req.file) {
        image_url = "https://res.cloudinary.com/dvp8npxkx/image/upload/v1766965584/CafeHop/kyxfxtfpmj31erdr3mde.jpg";
        image_filename = "cafe_default";
    } else {
        image_url = req.file.path;
        image_filename = req.file.filename;
    }

    //Save image into cafe object
    cafe.image = {
        url: image_url,
        filename: image_filename
    };
    cafe.author = req.user._id; //set the author of our new cafe as current user
    //console.log("Cafe's author is", cafe.author);
    //console.log("Our cafe: ", cafe);
    await cafe.save();
    req.flash('success', 'Cafe created successfully! :)');
    res.redirect(`/cafes/${cafe._id}`)
}

module.exports.showCafe = async (req, res, next) => {
    const cafe = await Cafe.findById(req.params.id).populate({
        path: 'reviews', //get full details of each review instead of red
        populate: { // Get full author details for each review
            path: 'author'
        }
    }).populate('author'); //we want details from schema we're referencing from


    res.render('cafes/show.ejs', { cafe, priceDisplayOptions, seatingDisplayOptions, wifiDisplayOptions });
}

module.exports.renderEditCafeForm = async (req, res, next) => {
    const cafe = await Cafe.findById(req.params.id);

    if (!cafe) {
        req.flash("error", "Cafe could not be found :'(");
        return res.redirect('/cafes');
    }
    res.render('cafes/edit.ejs', { cafe, priceFormOptions, seatingFormOptions });
}

module.exports.editCafe = async (req, res, next) => { //Put makes it able to edit
    //if (!req.body.cafe) throw new ExpressError('Invalid edit data', 400);
    const { id } = req.params;

    const geoData = await maptilerClient.geocoding.forward(req.body.cafe.location, { limit: 1 });
    // console.log(geoData);
    if (!geoData.features?.length) {
        req.flash('error', 'Could not geocode that location. Please try again and enter a valid location.');
        return res.redirect(`/cafes/${id}/edit`);
    }

    const updatedCafe = await Cafe.findByIdAndUpdate(id, { ...req.body.cafe });

    updatedCafe.geometry = geoData.features[0].geometry;
    updatedCafe.location = geoData.features[0].place_name;

    //Delete current image and replace with default:
    if (req.body.deleteImage) {
        //if there's an existing image and it is not the default image:
        if (updatedCafe.image && updatedCafe.image.filename !== 'cafe_default') {
            //delete from cloudinary
            await cloudinary.uploader.destroy(updatedCafe.image.filename);
        }

        //Now set the image to the default image:
        updatedCafe.image = {
            url: "https://res.cloudinary.com/dvp8npxkx/image/upload/v1766965584/CafeHop/kyxfxtfpmj31erdr3mde.jpg",
            filename: "cafe_default"
        };
    }
    //Problem, if person doesn't delete and they only upload old image is not deleted from cloudinary

    //overwrite existing image
    if (req.file) {
        image_url = req.file.path      // secure_url
        image_filename = req.file.filename  // public_id
        updatedCafe.image = {
            url: image_url,
            filename: image_filename
        };
    }

    await updatedCafe.save();

    req.flash('success', 'Cafe updated successfully! :)');
    res.redirect(`/cafes/${updatedCafe._id}`);
}

module.exports.deleteCafe = async (req, res, next) => {
    const { id } = req.params;
    const deletedCafe = await Cafe.findByIdAndDelete(id);
    req.flash('success', 'Cafe deleted successfully! :)');
    res.redirect("/cafes")
}

module.exports.search = async (req, res) => { //Here we list the address

    const { search } = req.query; //has location, seating and wifi parameters
    //console.log(req.query);

    //if locaion is not specified:
    if (!search || !search.location || !search.location.trim()) {
        let cafes = await Cafe.find({});
        let mapCenter = [-79.3832, 43.6532]; // [lng, lat] for Toronto

        return res.render('cafes/search.ejs', { cafes, filters: {}, mapCenter, priceDisplayOptions, seatingDisplayOptions, wifiDisplayOptions });
    }

    const geoData = await maptilerClient.geocoding.forward(search.location, { limit: 1 });
    //console.log(geoData);
    const [longitude, latitude] = geoData.features[0].geometry.coordinates;

    const closestCafes = {
        geometry: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [Number(longitude), Number(latitude)]
                },
            }
        }
    };

    filter = {}

    if (search.wifi === 'true') {
        //console.log("need to filter for wifi to be true");
        filter.wifi = true;
    }

    if (search.seating === "seating_available") {
        filter.seating = { $in: ["limited", "lots"] };
    } else if (search.seating === "lots") {
        filter.seating = "lots"
    }

    if (search.price === "$") {
        filter.price = "$";
    } else if (search.price === "$$") {
        filter.price = "$$";
    } else if (search.price === "$$$") {
        filter.price = "$$$";
    }

    const cafes = await Cafe.aggregate([
        {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [longitude, latitude]
                },
                distanceField: "distanceInMeters",
                spherical: true,
                query: filter
            }
        }
    ]);

    /*console.log("hello", cafes);
    if (cafes.length === 0) {
        console.log("empty cafe collection");
        //const cafes = await Cafe.find({});
    }*/
    //const cafes = await Cafe.find(filter);


    //Add statement here so that if this query is empty then it will give all cafes. otherwise it does the following


    let mapCenter = [longitude, latitude]//[43.6532, -79.3832]; // default to Toronto
    /*if (search.location && geoData.features.length) { //see if we have user's location or user specified location
        const [lng, lat] = geoData.features[0].geometry.coordinates;
        mapCenter = [lng, lat];
    }*/

    res.render('cafes/search.ejs', { cafes, mapCenter, priceDisplayOptions, seatingDisplayOptions, wifiDisplayOptions }) //should we get a response from the form and use that to show results?
};
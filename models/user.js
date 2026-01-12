const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true //not a validation
    }
});


//Will add password and username field and checks if it's unique
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model('User', userSchema);

module.exports = User;



/*const userSchema = new Schema({
    email: {
        type:String
    },
    username: {
        type: String,
        required: [true, 'Hey you need to have a username pal'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'You need to have a password!!'],
    },    
    cafe: {
        type: Schema.Types.ObjectId,
        ref: 'Cafe'
    },
    reviews: {
        type: Schema.Types.ObjectId, 
        ref: 'Review'
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User; 
*/
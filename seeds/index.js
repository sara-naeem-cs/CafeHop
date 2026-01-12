const mongoose = require('mongoose')
const Cafe = require('../models/cafe.js');

mongoose.connect('mongodb://localhost:27017/cafeHop'); //this is our database name

const db = mongoose.connection;
db.on("error", err => console.error("Connection error:", err));
db.once("open", () => console.log("Database connected"));


const cities = [
    { city: "Downtown Toronto, ON", latitude: 43.6532, longitude: -79.3832 },
    { city: "Queen St W & Spadina Ave, Toronto, ON", latitude: 43.6475, longitude: -79.3950 },
    { city: "King St W & Bathurst St, Toronto, ON", latitude: 43.6456, longitude: -79.4022 },
    { city: "Distillery District, Toronto, ON", latitude: 43.6503, longitude: -79.3596 },
    { city: "St. Lawrence Market, Toronto, ON", latitude: 43.6487, longitude: -79.3716 },
    { city: "Yonge & Dundas Square, Toronto, ON", latitude: 43.6561, longitude: -79.3802 },
    { city: "Yorkville, Toronto, ON", latitude: 43.6702, longitude: -79.3899 },
    { city: "Harbourfront Centre, Toronto, ON", latitude: 43.6389, longitude: -79.3817 },
    { city: "Chinatown (Spadina Ave), Toronto, ON", latitude: 43.6535, longitude: -79.3970 },
    { city: "Kensington Market, Toronto, ON", latitude: 43.6544, longitude: -79.4007 },
    { city: "Financial District, Toronto, ON", latitude: 43.6481, longitude: -79.3810 },
    { city: "Entertainment District, Toronto, ON", latitude: 43.6467, longitude: -79.3925 },
    { city: "College St & Ossington Ave, Toronto, ON", latitude: 43.6554, longitude: -79.4195 },
    { city: "Queen St E & Broadview Ave, Toronto, ON", latitude: 43.6596, longitude: -79.3486 },
    { city: "Liberty Village, Toronto, ON", latitude: 43.6386, longitude: -79.4277 },
    { city: "Yonge & Bloor, Toronto, ON", latitude: 43.6710, longitude: -79.3860 },
    { city: "Bay St Corridor, Toronto, ON", latitude: 43.6600, longitude: -79.3858 },
    { city: "Dufferin Grove, Toronto, ON", latitude: 43.6566, longitude: -79.4354 },
    { city: "Spadina & College, Toronto, ON", latitude: 43.6577, longitude: -79.4000 },
    { city: "Waterfront Toronto (Queens Quay), Toronto, ON", latitude: 43.6408, longitude: -79.3769 }
];


const cafeNames = [
    "Cool Beans", "Java Junction", "Brewed Awakening", "Bean There",
    "Perk Up", "Mocha Madness", "The Daily Grind", "Cup o' Joy",
    "Espresso Express", "Steamy Beans", "Caffeine Dreams", "Latte Love",
    "Coffee Corner", "Bean Scene", "Sip & Savor", "Brew Crew",
    "Mug Life", "Grounds & Hounds", "Roast & Toast", "Cafe Connect",
    "Morning Buzz", "Daily Drip", "Urban Grind", "Bean Boulevard",
    "Rise & Grind", "Mocha Mingle", "Cafe Haven", "Brewed Bliss",
    "Java House", "Cuppa Culture", "Steam & Sip", "Cosmic Coffee",
    "Velvet Roast", "Drip District", "Roast Republic", "Brew Hub",
    "Caffeine Collective", "Bean Barn", "Perk Palace", "Roastery Lane",
    "Coffee Cove", "Cafe Mosaic", "Brew Bar", "Golden Mug",
    "Bean Bistro", "Daily Dose", "Mocha Market", "Cafe Aurora",
    "Cuppa Corner", "Roast Realm"
];

const sample = array => array[Math.floor(Math.random() * array.length)];
const seedDB = async () => {
    await Cafe.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random20 = Math.floor(Math.random() * 20);
        //const price = Math.floor(Math.random() * 10) + 5;
        const prices = ['$', '$$', '$$$'];
        const seatings = ['pickup_only', 'limited', 'lots'];


        const cafe = new Cafe({
            location: `${cities[random20].city}`,
            author: '693651cb69dfa29a3ad7eae9',
            title: `${cafeNames[i]}`,
            image: {
                url: "https://res.cloudinary.com/dvp8npxkx/image/upload/v1766965584/CafeHop/kyxfxtfpmj31erdr3mde.jpg",
                filename: "cafe_default"
            },
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam officiis dolore qui voluptatem.",
            price: sample(prices),
            seating: sample(seatings),
            wifi: true,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random20].longitude,
                    cities[random20].latitude,
                ]
            },
        })
        await cafe.save(); //save one at a time
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});

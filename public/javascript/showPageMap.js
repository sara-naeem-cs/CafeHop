maptilersdk.config.apiKey = maptilerApiKey;

//shows a map
const map = new maptilersdk.Map({
    container: 'map',
    style: maptilersdk.MapStyle.BRIGHT,
    center: cafe.geometry.coordinates, // starting position [lng, lat]
    zoom: 10 // starting zoom
});

//when we click campground marker it shows details about it
new maptilersdk.Marker()
    //Use longitude and latitude from campground to render marker
    .setLngLat(cafe.geometry.coordinates)
    .setPopup(
        new maptilersdk.Popup({ offset: 25 })
            .setHTML(
                `<h3>${cafe.title}</h3><p>${cafe.location}</p>`
            )
    )
    .addTo(map)
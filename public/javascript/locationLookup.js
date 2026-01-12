const searchBox = document.getElementById("location");
const list = document.getElementById('foundLocations');
maptilersdk.config.apiKey = maptilerApiKey;


//const query = "toronto";
async function fetchLocations(query) {
    const res = await axios.get(`https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json`, {
        params: {
            key: maptilerApiKey,
            limit: 5,
            proximity: "ip",
            fuzzyMatch: true,
            types: 'address,poi,place,locality',
            country: 'US,CA,MX',
            bbox: [-170.0, 5.0, -50.0, 85.0]
        }
    });
    //console.log(res.data);
    const locationsList = res.data.features.map(f => f.place_name);

    return locationsList
}


searchBox.addEventListener('keydown', async function (event) {
    list.innerHTML = "";
    if (searchBox.value.length < 3) return;
    const locationsList = await fetchLocations(searchBox.value);

    locationsList.forEach((location, index) => {
        const li = document.createElement("li");
        li.textContent = location;

        li.classList.add("list-group-item", "list-group-item-action");
        li.style.cursor = "pointer";
        if (index === 0) li.classList.add("rounded-top");
        if (index === locationsList.length - 1) li.classList.add("rounded-bottom");

        li.addEventListener("click", () => {
            searchBox.value = location;
            list.innerHTML = "";
        })
        list.appendChild(li);
    });
});


//hide list if user selects outside of the input box
document.addEventListener('click', (event) => {
    if (!searchBox.contains(event.target) && !list.contains(event.target)) {
        list.innerHTML = "";
    }
});
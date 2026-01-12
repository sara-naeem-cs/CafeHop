const searchBox = document.getElementById("name");
const list = document.getElementById('foundCafes');

async function fetchCafes(query) {
    const res = await axios.get(`/cafes/autocompleteName?q=${encodeURIComponent(query)}`);
    const namesList = res.data.map(f => f.title);

    console.log(res);
    return namesList
}

searchBox.addEventListener('keydown', async function (event) {
    list.innerHTML = "";
    if (searchBox.value.length < 3) return;
    const cafesList = await fetchCafes(searchBox.value);
    console.log(cafesList);


    cafesList.forEach((name, index) => {
        const li = document.createElement("li");
        li.textContent = name;

        li.classList.add("list-group-item", "list-group-item-action");
        li.style.cursor = "pointer";
        if (index === 0) li.classList.add("rounded-top");
        if (index === cafesList.length - 1) li.classList.add("rounded-bottom");

        li.addEventListener("click", () => {
            searchBox.value = name;
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
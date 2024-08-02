// GET AUTHENTICATION TOKEN
function getCookie(name) {
    const cookies = new URLSearchParams(document.cookie.replace(/; /g, '&'));
    return cookies.get(name) || null;
}

document.addEventListener('DOMContentLoaded', () => {

    // VERIFY ACCESS TOKEN TO HIDE LOGIN LINK
    const loginLink = document.getElementById('login-link');
    const cookieToken = getCookie('token');

    if (!cookieToken) {
        loginLink.style.display = 'flex';
    } else {
        loginLink.style.display = 'none';
    }

    // POPULATE COUNTRY DROPDOWN BOX
    const countryFilter = document.getElementById('country-filter');
    function populateCountryFilter(places) {
        const countries = [... new Set(places.map(place => place.country_name))];
        countryFilter.innerHTML = '<option value="">Select Country</option>'; //RESET FILTER
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            countryFilter.appendChild(option);
        });
    }

    // FILTER PLACES BY COUNTRY
    function filterPlaces(places, country) {
        if (!country) return places;
        return places.filter(place => place.country_name === country);
    }

    // DISPLAY PLACE CARDS
    const placesList = document.getElementById('places-list');
    function displayPlaces(places) {
        placesList.innerHTML = '';
        places.forEach(place => {
            const placeCard = document.createElement('div');
            placeCard.className = 'place-card';
            placeCard.innerHTML = `
            <img src="images/places/${place.id}.jpg" alt="${place.id}" class="place-image">
            <h3>${place.id}</h3>
            <p>Price per night: $${place.price_per_night}</p>
            <p>Location: ${place.city_name}, ${place.country_name}</p>
            <button class="details-button" onclick="location.href='place.html?id=${place.id}'">View Details</button>
            `;
            placesList.appendChild(placeCard);
        });
    }

    // FETCH PLACES DATA FROM API
    async function fetchPlaces(token) {
        try {
            const response = await fetch('http://127.0.0.1:5000/places', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch places');
            const places = await response.json();
            populateCountryFilter(places);
            displayPlaces(places); // DISPLAY PLACES

            countryFilter.addEventListener('change', () => {
                const country = countryFilter.value;
                const filteredPlaces = filterPlaces(places, country);
                displayPlaces(filteredPlaces);
            });
        } catch (error) {
            console.error('Error fetching places:', error);
        }
    }

    fetchPlaces(cookieToken);
});

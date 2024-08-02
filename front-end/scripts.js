// GET AUTHENTICATION TOKEN
function getCookie(name) {
    const cookies = new URLSearchParams(document.cookie.replace(/; /g, '&'));
    return cookies.get(name) || null;
}

// PARSE URL TO GET PLACE-ID
function getPlaceIdFromURL() {
    const queryString = window.location.search;
    const urlparams = new URLSearchParams(queryString);
    const placeId = urlparams.get('id');
    return placeId;
}

// STARS FOR THE RATING CAUSE IM EXTRA LIKE THAT
function getStarRating(rating) {
    const fullStar = '★';
    const emptyStar = '☆';
    const starCount = 5;
    let stars = '';

    for (let i = 0; i < starCount; i++) {
        if (i < rating) {
            stars += fullStar;
        } else {
            stars += emptyStar;
        }
    }
    return stars;
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    // HANDLE USER LOGIN
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // PREVENT DEFAULT FORM SUBMISSION

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://127.0.0.1:5000/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                if (response.ok) {
                    const data = await response.json();
                    document.cookie = `token=${data.access_token}; path=/; secure; samesite=strict`;
                    window.location.href = 'index.html'; // REDIRECT TO MAIN PAGE
                } else {
                    const errorData = await response.json();
                    errorMessage.textContent = errorData.message || 'Login failed';
                    errorMessage.style.display = 'block';
                }
            } catch (error) {
                console.error('Error during login:', error);
                errorMessage.textContent = 'An error occurred while trying to log in. Please try again.';
                errorMessage.style.display = 'block';
            }
        });
    }

    // VERIFY ACCESS TOKEN TO HIDE LOGIN LINK
    const loginLink = document.getElementById('login-link');
    const cookieToken = getCookie('token');

    if (!cookieToken) {
        loginLink.style.display = 'flex';
    } else {
        loginLink.style.display = 'none';
    }

    // FETCH PLACES DATA
    const countryFilter = document.getElementById('country-filter');
    fetchPlaces(cookieToken);

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
            populateCountryFilter(places); // FILTER BY COUNTRY
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

    // POPULATE COUNTRY DROPDOWN BOX
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

    // DISPLAY PLACE CARDS ON PLACES LIST
    const placesList = document.getElementById('places-list');

    function displayPlaces(places) {
        placesList.innerHTML = ''; // CLEAR LIST
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

    // HANDLE PLACE DETAILS
    const placeId = getPlaceIdFromURL();

    if (placeId) {
        fetchPlaceDetails(cookieToken, placeId);
        const addReviewSection = document.getElementById('add-review');
        if (cookieToken) {
            addReviewSection.style.display = 'block';
        } else {
            addReviewSection.style.display = 'none';
        }
    }

    // FETCH PLACE DETAILS TO DISPLAY
    async function fetchPlaceDetails(token, placeId) {
        try {
            const response = await fetch(`http://127.0.0.1:5000/places/${placeId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch place details');
            const placeDetails = await response.json();
            displayPlaceDetails(placeDetails);

        } catch (error) {
            console.error('Error fetching place details:', error);
        }
    }

    // DISPLAY PLACE DETAILS
    function displayPlaceDetails(place) {
        const placeDetailsSection = document.getElementById('place-details');
        const placeElement = document.createElement('div');
        placeElement.innerHTML = `
        <h1>${place.id}</h1>
        <div class="container">
            <img src='images/places/${place.id}.jpg' alt="Image" class="place-image-large">
            <div class="place-info">
                <p><b>Host:</b> ${place.host_name}</p>
                <p><b>Price pre night:</b> $${place.price_per_night}</p>
                <p><b>Location:</b> ${place.city_name}, ${place.country_name}</p>
                <p><b>Description:</b> ${place.description}</p>
                <p><b>Amenities:</b> ${place.amenities.join(', ')}</p>
            </div>
        </div>
        `;
        placeDetailsSection.appendChild(placeElement);
        const reviewSection = document.querySelector('.reviews')
        const reviews = place.reviews;
        reviews.forEach(review => {
            const reviewCard = document.createElement('div');
            reviewCard.className = 'review-card';
            reviewCard.innerHTML = `
            <p><b>${review.user_name}</b></p>
            <p>Rating: ${getStarRating(review.rating)}</p>
            <p>"${review.comment}"</p>
            `;
            reviewSection.appendChild(reviewCard);
        });
    }

    // HANDLE REVIEW FROM
    const reviewForm = document.getElementById('review-form');

    if (reviewForm) {
        reviewForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // PREVENT DEFAULT FORM SUBMISSION

            const reviewText = document.getElementById('review').value;
            const rating = document.getElementById('rating').value;
            submitReview(cookieToken, placeId, rating, reviewText);
        });
    }

    // SUBMIT REVIEW TO API
    async function submitReview(token, placeId, rating, reviewText) {
        try {
            const response = await fetch(`http://127.0.0.1:5000/places/${placeId}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ rating: rating, review: reviewText })
            });

            if (response.ok) {
                alert('Review submitted successfully!');
                document.getElementById('review-form').reset();
            } else {
                const errorData = await response.json();
                alert(`Failed to submit review: ${errorData.message}`);
            }

        } catch (error) {
            console.error('Error fetching places:', error);
        }
    }
});

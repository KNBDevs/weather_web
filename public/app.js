document.addEventListener("DOMContentLoaded", () => {
    const weatherDiv = document.getElementById('weather');
    const locationDiv = document.getElementById('location');
    const form = document.getElementById('search-form');
    const cityInput = document.getElementById('city-input');
    const placeholderTime = document.getElementById('placeholder-time');

    let timezoneOffset = 0;
    
    // Obtener la ubicación del usuario
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            getWeatherByCoords(latitude, longitude);
        }, error => {
            weatherDiv.textContent = 'Unable to retrieve your location';
        });
    } else {
        weatherDiv.textContent = 'Geolocation is not supported by this browser.';
    }

    form.addEventListener('submit', e => {
        e.preventDefault();
        const city = cityInput.value;
        getWeatherByCity(city);
    });

    function getWeatherByCoords(latitude, longitude) {
        fetch(`/weather?lat=${latitude}&lon=${longitude}&lang=es`)
            .then(response => response.json())
            .then(data => {
                timezoneOffset = data.timezone;
                displayWeather(data);
                startClock();
            })
            .catch(error => console.error('Error fetching weather data:', error));
    }

    function getWeatherByCity(city) {
        fetch(`/weather?city=${city}&lang=es`)
            .then(response => response.json())
            .then(data => {
                timezoneOffset = data.timezone;
                displayWeather(data);
                startClock();
            })
            .catch(error => console.error('Error fetching weather data:', error));
    }

    function displayWeather(data) {
        if (data.cod === '404') {
            weatherDiv.textContent = 'Ciudad no encontrada';
            return;
        }

        const localTime = calculateLocalTime(timezoneOffset);
        const capitalizedDescription = capitalizeWords(data.weather[0].description);


        locationDiv.textContent = `${data.name}, ${data.sys.country}`;
        weatherDiv.innerHTML = `
            <p>Temperatura: ${data.main.temp} °C</p>
            <p>Clima: ${capitalizedDescription}</p>
            <p>Humedad: ${data.main.humidity}%</p>
            <p>Velocidad del viento: ${data.wind.speed} m/s</p>
            <p id="local-time" class="hidden">Hora local: ${localTime}</p>
        `;

        placeholderTime.classList.add('hidden');

        // Añadir animaciones
        locationDiv.classList.add('fade-in');
        weatherDiv.classList.add('fade-in');
    }

    function calculateLocalTime(offset) {
        const utcDate = new Date(Date.now());
        const localDate = new Date(utcDate.getTime() + offset * 1000);
        localDate.setHours(localDate.getHours() - 2);
        return localDate;
    }

    function startClock() {
        setInterval(() => {
            const localDate = calculateLocalTime(timezoneOffset);
            const localTimeElement = document.getElementById('local-time');
            localTimeElement.textContent = `Hora local: ${localDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
            localTimeElement.classList.remove('hidden');
        }, 1000);
    }

    function capitalizeWords(text) {
        return text.replace(/\b\w/g, char => char.toUpperCase());
    }
});

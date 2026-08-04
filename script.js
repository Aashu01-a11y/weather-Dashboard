/* ==========================================================
   WEATHER DASHBOARD
   Part 3.1
========================================================== */

//=========================
// DOM ELEMENTS
//=========================
const pm25 =
document.getElementById("pm25");


const pm10 =
document.getElementById("pm10");


const co =
document.getElementById("co");


const no2 =
document.getElementById("no2");
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const themeBtn = document.getElementById("themeBtn");
const unitBtn = document.getElementById("unitBtn");

const loader = document.getElementById("loader");
const errorCard = document.getElementById("errorCard");
const historyList = document.getElementById("historyList");

const cityName = document.getElementById("cityName");
const currentDate = document.getElementById("currentDate");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const weatherIcon = document.getElementById("weatherIcon");

const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const visibility = document.getElementById("visibility");
const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");
const pressure = document.getElementById("pressure");
const windDirection = document.getElementById("windDirection");

const forecastContainer = document.getElementById("forecast");
const hourlyContainer = document.getElementById("hourlyForecast");

const aqi = document.getElementById("aqi");
const aqiStatus = document.getElementById("aqiStatus");

//=========================
// APP STATE
//=========================

let currentUnit = "metric";
let currentWeather = null;

//=========================
// UTILITIES
//=========================

function showLoader(){

    loader.classList.remove("hidden");

    searchBtn.disabled=true;

}

function hideLoader(){

    loader.style.display = "none";

}

function showError(message="City not found"){

    errorCard.classList.remove("hidden");

    errorCard.querySelector("h2")
    .textContent = message;

}

function hideError() {
    errorCard.classList.add("hidden");
}

function formatTime(timestamp) {

    return new Date(timestamp * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

}

function formatDate() {

    const today = new Date();

    currentDate.textContent =
        today.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        });

}

function getDirection(deg) {

    const directions = [
        "N","NE","E","SE",
        "S","SW","W","NW"
    ];

    return directions[
        Math.round(deg / 45) % 8
    ];

}

//=========================
// WEATHER BACKGROUND
//=========================

function updateBackground(weather) {

    document.body.classList.remove(
        "clear",
        "clouds",
        "rain",
        "snow",
        "mist",
        "thunderstorm"
    );

    switch (weather.toLowerCase()) {

        case "clear":
            document.body.classList.add("clear");
            break;

        case "clouds":
            document.body.classList.add("clouds");
            break;

        case "rain":
        case "drizzle":
            document.body.classList.add("rain");
            break;

        case "snow":
            document.body.classList.add("snow");
            break;

        case "mist":
        case "fog":
        case "haze":
            document.body.classList.add("mist");
            break;

        case "thunderstorm":
            document.body.classList.add("thunderstorm");
            break;

    }

}

//=========================
// UPDATE UI
//=========================

function updateCurrentWeather(data) {

    currentWeather = data;

    cityName.textContent = data.name;

    temperature.textContent =
        `${Math.round(data.main.temp)}°${
            currentUnit === "metric" ? "C" : "F"
        }`;

    description.textContent =
        data.weather[0].description;

    weatherIcon.src =
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

    feelsLike.textContent =
        `${Math.round(data.main.feels_like)}°`;

    humidity.textContent =
        `${data.main.humidity}%`;

    wind.textContent =
        `${data.wind.speed} ${
            currentUnit === "metric"
                ? "m/s"
                : "mph"
        }`;

    visibility.textContent =
        `${(data.visibility / 1000).toFixed(1)} km`;

    pressure.textContent =
        `${data.main.pressure} hPa`;

    sunrise.textContent =
        formatTime(data.sys.sunrise);

    sunset.textContent =
        formatTime(data.sys.sunset);

    windDirection.textContent =
        getDirection(data.wind.deg);

    updateBackground(
        data.weather[0].main
    );

}

//=========================
// CURRENT WEATHER
//=========================

async function getWeather(city) {

    showLoader();
    hideError();

    try {

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${currentUnit}`
        );

        if (!response.ok) {
            throw new Error("City not found");
        }

        const data = await response.json();

        // Display current weather
        updateCurrentWeather(data);

        // Load Hourly Forecast
        await getHourlyForecast(city);

        // Load 5-Day Forecast
        await getForecast(city);

        // Load Air Quality Index
        await getAQI(
            data.coord.lat,
            data.coord.lon
        );

        // Save search history
        saveSearch(city);

    } catch (error) {

        console.error(error);

        showError("Unable to fetch weather data.");

    } finally {

        hideLoader();

    }
}
//=========================
// EVENTS
//=========================

searchBtn.addEventListener("click", () => {

    const city = cityInput.value.trim();

    if (city !== "") {

        getWeather(city);

    }

});

cityInput.addEventListener(
"keydown",
(event)=>{

    if(event.key==="Enter"){

        const city =
        cityInput.value.trim();


        if(city){

            getWeather(city);

        }

    }

});

//=========================
// INITIAL LOAD
//=========================

formatDate();

getWeather("Delhi");
//==========================================================
// 5 DAY FORECAST
//==========================================================

async function getForecast(city){

    try{

        const response = await fetch(

`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${currentUnit}`

        );


        if(!response.ok)
            throw new Error();


        const data = await response.json();


        forecastContainer.innerHTML = "";


        // Select one forecast per day (12 PM)

        const dailyForecast = data.list.filter(item =>
            item.dt_txt.includes("12:00:00")
        );


        dailyForecast.forEach(day=>{


            const date = new Date(day.dt_txt);


            const card = document.createElement("div");

            card.className="forecast-card";


            card.innerHTML=`

                <h4>
                    ${date.toLocaleDateString(
                        "en-US",
                        {
                            weekday:"short"
                        }
                    )}
                </h4>


                <img src="
                https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png
                ">


                <h3>
                    ${Math.round(day.main.temp)}°
                </h3>


                <p>
                    ${day.weather[0].main}
                </p>

            `;


            forecastContainer.appendChild(card);


        });


    }

    catch(error){

        console.log(
            "Forecast error",
            error
        );

    }

}



//==========================================================
// HOURLY FORECAST
//==========================================================

async function getHourlyForecast(city){


    try{


        const response = await fetch(

`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${currentUnit}`

        );


        const data = await response.json();


        hourlyContainer.innerHTML="";


        // First 8 forecasts = 24 hours

        const hourly =
            data.list.slice(0,8);



        hourly.forEach(hour=>{


            const time =
                new Date(hour.dt_txt)
                .toLocaleTimeString(
                    [],
                    {
                        hour:"2-digit"
                    }
                );



            const card =
            document.createElement("div");


            card.className="hour-card";


            card.innerHTML=`

                <h4>
                    ${time}
                </h4>


                <img src="
                https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png
                ">


                <h3>
                    ${Math.round(hour.main.temp)}°
                </h3>


                <p>
                    ${hour.weather[0].main}
                </p>


            `;


            hourlyContainer.appendChild(card);



        });


    }

    catch(error){

        console.log(
            "Hourly error",
            error
        );

    }


}




//==========================================================
// AIR QUALITY INDEX
//==========================================================

async function getAQI(lat, lon) {

    try {

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error("Unable to fetch AQI");
        }

        const data = await response.json();

        console.log("AQI Response:", data);

        const air = data.list[0];

        // AQI Number
        document.getElementById("aqi").textContent = air.main.aqi;

        // AQI Status
        let status = "";

        switch (air.main.aqi) {
            case 1:
                status = "🟢 Good";
                break;
            case 2:
                status = "🟡 Fair";
                break;
            case 3:
                status = "🟠 Moderate";
                break;
            case 4:
                status = "🔴 Poor";
                break;
            case 5:
                status = "🟣 Very Poor";
                break;
            default:
                status = "Unknown";
        }

        document.getElementById("aqiStatus").textContent = status;

        // Pollutants (Only if these IDs exist in HTML)

        const pm25 = document.getElementById("pm25");
        const pm10 = document.getElementById("pm10");
        const co = document.getElementById("co");
        const no2 = document.getElementById("no2");

        if (pm25) pm25.textContent = air.components.pm2_5 + " μg/m³";
        if (pm10) pm10.textContent = air.components.pm10 + " μg/m³";
        if (co) co.textContent = air.components.co + " μg/m³";
        if (no2) no2.textContent = air.components.no2 + " μg/m³";

    } catch (error) {

        console.error("AQI Error:", error);

        document.getElementById("aqi").textContent = "--";
        document.getElementById("aqiStatus").textContent = "Unable to load AQI";
    }
}

//==========================================================
// CURRENT LOCATION WEATHER
//==========================================================

locationBtn.addEventListener(
"click",
()=>{


    if(
        navigator.geolocation
    ){


        showLoader();



        navigator.geolocation.getCurrentPosition(

        async(position)=>{


            const lat =
            position.coords.latitude;


            const lon =
            position.coords.longitude;



            try{


                const response =
                await fetch(

`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`

                );


                const data =
                await response.json();



                updateCurrentWeather(data);

                    getForecast(city);

                  getHourlyForecast(city);

                       
                getForecastByCoordinates(
                    lat,
                    lon
                );


                getHourlyByCoordinates(
                    lat,
                    lon
                );


                getAQI(
                    lat,
                    lon
                );



            }

            catch{

                showError();

            }


            finally{

                hideLoader();

            }


        },


        ()=>{

            hideLoader();

            alert(
            "Location permission denied"
            );

        }


        );

    }


});




//==========================================================
// FORECAST USING COORDINATES
//==========================================================

async function getForecastByCoordinates(lat,lon){


    const response =
    await fetch(

`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`

    );


    const data =
    await response.json();



    forecastContainer.innerHTML="";



    data.list
    .filter(item =>
        item.dt_txt.includes("12:00:00")
    )
    .forEach(day=>{


        const card =
        document.createElement(
            "div"
        );


        card.className =
        "forecast-card";



        card.innerHTML=`

        <h4>
        ${new Date(day.dt_txt)
        .toLocaleDateString(
        "en-US",
        {
        weekday:"short"
        })}
        </h4>


        <img src="
        https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png">


        <h3>
        ${Math.round(day.main.temp)}°
        </h3>


        `;


        forecastContainer.appendChild(card);


    });


}




//==========================================================
// HOURLY USING COORDINATES
//==========================================================


async function getHourlyByCoordinates(lat,lon){


    const response =
    await fetch(

`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${currentUnit}`

    );


    const data =
    await response.json();



    hourlyContainer.innerHTML="";



    data.list
    .slice(0,8)
    .forEach(hour=>{


        const card =
        document.createElement(
            "div"
        );


        card.className =
        "hour-card";



        card.innerHTML=`

        <h4>
        ${new Date(hour.dt_txt)
        .toLocaleTimeString(
        [],
        {
        hour:"2-digit"
        })}
        </h4>


        <img src="
        https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png">


        <h3>
        ${Math.round(hour.main.temp)}°
        </h3>

        `;


        hourlyContainer.appendChild(card);


    });


}
//==========================================================
// DARK / LIGHT MODE
//==========================================================


function loadTheme(){

    const savedTheme =
        localStorage.getItem("theme");


    if(savedTheme === "dark"){

        document.body.classList.add("dark");

        themeBtn.innerHTML =
        `<i class="fa-solid fa-sun"></i>`;

    }

}



themeBtn.addEventListener(
"click",
()=>{


    document.body.classList.toggle("dark");



    const darkMode =
    document.body.classList.contains("dark");



    if(darkMode){


        localStorage.setItem(
            "theme",
            "dark"
        );


        themeBtn.innerHTML =
        `<i class="fa-solid fa-sun"></i>`;


    }

    else{


        localStorage.setItem(
            "theme",
            "light"
        );


        themeBtn.innerHTML =
        `<i class="fa-solid fa-moon"></i>`;

    }


});



//==========================================================
// TEMPERATURE UNIT TOGGLE
//==========================================================


unitBtn.addEventListener(
"click",
()=>{


    if(currentUnit === "metric"){


        currentUnit="imperial";


        unitBtn.textContent="°F";


    }

    else{


        currentUnit="metric";


        unitBtn.textContent="°C";


    }



    if(currentWeather){


        const city =
        currentWeather.name;


        getWeather(city);


    }


});




//==========================================================
// SEARCH HISTORY
//==========================================================


function saveSearch(city){


    let searches =
    JSON.parse(
        localStorage.getItem(
            "history"
        )
    ) || [];



    city =
    city.toLowerCase();



    searches =
    searches.filter(
        item =>
        item !== city
    );



    searches.unshift(city);



    if(searches.length > 5){

        searches.pop();

    }



    localStorage.setItem(
        "history",
        JSON.stringify(searches)
    );



    displayHistory();

}





function displayHistory(){


    historyList.innerHTML="";



    const searches =
    JSON.parse(
        localStorage.getItem(
            "history"
        )
    ) || [];



    searches.forEach(city=>{


        const button =
        document.createElement(
            "div"
        );



        button.className =
        "history-item";



        button.textContent =
        city;



        button.addEventListener(
        "click",
        ()=>{


            getWeather(city);



        });



        historyList.appendChild(
            button
        );



    });



}




//==========================================================
// CONNECT SEARCH WITH HISTORY
//==========================================================


const oldGetWeather =
getWeather;



getWeather = async function(city){


    await oldGetWeather(city);



    saveSearch(city);


};

//==========================================================
// 5 DAY FORECAST
//==========================================================

async function getForecast(city) {

    try {

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${currentUnit}`
        );

        if (!response.ok) {
            throw new Error("Forecast API Error");
        }

        const data = await response.json();

        console.log("Forecast Data:", data);

        forecastContainer.innerHTML = "";

        const dailyForecast = [];

        data.list.forEach(item => {

            if (item.dt_txt.includes("12:00:00")) {
                dailyForecast.push(item);
            }

        });

        dailyForecast.forEach(day => {

            const card = document.createElement("div");
            card.className = "forecast-card";

            card.innerHTML = `
                <h3>${new Date(day.dt_txt).toLocaleDateString("en-US", {
                    weekday: "short"
                })}</h3>

                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png">

                <h2>${Math.round(day.main.temp)}°</h2>

                <p>${day.weather[0].main}</p>
            `;

            forecastContainer.appendChild(card);

        });

    } catch (error) {

        console.error("Forecast Error:", error);

    }

}


//==========================================================
// SAVE CURRENT SETTINGS
//==========================================================


function loadSettings(){


    loadTheme();


    displayHistory();



}



loadSettings();
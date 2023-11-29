sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
  ], function (Controller, MessageToast) {
    "use strict";
  
    return Controller.extend("weather.controller.Weather", {
      onInit: function () {},
  
      onGetWeather: function () {
        var cityInput = this.getView().byId("cityInput").getValue();
        var apiKey = "db9f053143446cc58b988adc4959b3c2";
        var weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityInput}&appid=${apiKey}`;
        var forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityInput}&appid=${apiKey}`;
  
        // Clear previous data
        this.getView().byId("weatherList").destroyItems();
        this.getView().byId("temperatureText").setText("");
        this.getView().byId("forecastList").destroyItems();
  
        // Get current weather
        fetch(weatherApiUrl)
          .then((response) => response.json())
          .then((data) => {
            if (data.weather && data.weather.length > 0) {
              var weather = data.weather[0].main;
              var temperatureCelsius = (data.main.temp - 273.15).toFixed(2);
              var emoji = this.getEmojiForWeather(weather);
              var weatherMeaning = this.getWeatherMeaning(weather);
              var description = `${temperatureCelsius}°C ${emoji} (${weatherMeaning})`;
  
              this.getView().byId("weatherList").addItem(new sap.m.StandardListItem({ title: cityInput, description: description }));
              var temperatureText = this.getView().byId("temperatureText");
              temperatureText.setText(description);
              temperatureText.addStyleClass("currentTemperature");
            } else {
              MessageToast.show("Weather data not found for " + cityInput);
            }
          })
          .catch((error) => {
            MessageToast.show("Error: " + error);
          });
  
        // Get 5-day forecast starting from the next day
        fetch(forecastApiUrl)
          .then((response) => response.json())
          .then((data) => {
            var forecastList = this.getView().byId("forecastList");
            forecastList.destroyItems();
  
            const currentDate = new Date();
            let nextDate = new Date();
            nextDate.setDate(currentDate.getDate() + 1);
  
            data.list.forEach((item) => {
              const itemDate = new Date(item.dt * 1000);
              if (itemDate.getDate() === nextDate.getDate()) {
                const forecast = item.weather[0].main;
                const temperatureCelsius = (item.main.temp - 273.15).toFixed(2);
                const emoji = this.getEmojiForWeather(forecast);
                const weatherMeaning = this.getWeatherMeaning(forecast);
                const description = `${temperatureCelsius}°C ${emoji} (${weatherMeaning})`;
  
                const listItem = new sap.m.StandardListItem({ title: this.formatDate(nextDate), description: description });
                forecastList.addItem(listItem);
  
                if (itemDate.getDate() === currentDate.getDate()) {
                  listItem.addStyleClass("currentTemperature");
                }
  
                nextDate.setDate(nextDate.getDate() + 1);
              }
            });
          })
          .catch((error) => {
            MessageToast.show("Error fetching forecast: " + error);
          });
      },
  
      formatDate: function (date) {
        var options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
        return date.toLocaleDateString("en-US", options);
      },
  
      getEmojiForWeather: function (weather) {
        const emojiMap = {
          "Clear": "☀️",
          "Clouds": "☁️",
          "Rain": "🌧️",
          "Snow": "❄️",
          "Thunderstorm": "⛈️",
          "Mist": "🌫️",
        };
  
        return emojiMap[weather] || "❓";
      },
  
      getWeatherMeaning: function (weather) {
        const meaningMap = {
          "Clear": "Clear Sky",
          "Clouds": "Cloudy",
          "Rain": "Rainy",
          "Snow": "Snowy",
          "Thunderstorm": "Thunderstorm",
          "Mist": "Misty",
        };
  
        return meaningMap[weather] || "Unknown";
      },
    });
  });
  
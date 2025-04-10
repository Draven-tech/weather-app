import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Geolocation } from '@capacitor/geolocation';
import { Network } from '@capacitor/network';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements AfterViewInit {
  map!: L.Map;
  weather: any;
  forecast: any[] = [];
  apiKey = '718989f262a375b4a2dafb98323ef8c1';
  searchQuery = '';
  isCelsius = true;
  sunriseTime = '';
  sunsetTime = '';
  userMarker: any;

  constructor(private http: HttpClient, private alertCtrl: AlertController) {}

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    } else {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    }
  }

  ngAfterViewInit() {
    this.loadMap(); 
  }

  async loadMap() {
    try {
      const coordinates = await Geolocation.getCurrentPosition();
      const lat = coordinates.coords.latitude;
      const lon = coordinates.coords.longitude;

      this.initializeMap(lat, lon);

      this.userMarker = L.marker([lat, lon], {
        icon: L.icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      }).addTo(this.map)
      .bindPopup('You are here!')
      .openPopup();

      this.getWeather(lat, lon);
      this.getForecast(lat, lon);
    } catch (err) {
      console.error('Geolocation error:', err);

      const status = await Network.getStatus();
      if (status.connected) {
        this.showOfflineNotification();
      } else {
        this.showOfflineNotification();
      }
    }
  }

  initializeMap(lat: number, lon: number) {
    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('map').setView([lat, lon], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    const icon = L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    this.userMarker = L.marker([lat, lon], { icon }).addTo(this.map)
      .bindPopup('You are here!')
      .openPopup();
  }

  getWeather(lat: number, lon: number) {
    const unit = this.isCelsius ? 'metric' : 'imperial';
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${this.apiKey}`;
    this.http.get(url).subscribe((data: any) => {
      this.weather = data;
      this.sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
      this.sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString();
      this.cacheWeatherData(data);
    });
  }

  getForecast(lat: number, lon: number) {
    const unit = this.isCelsius ? 'metric' : 'imperial';
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${this.apiKey}`;
    this.http.get(url).subscribe((data: any) => {
      const daily: any = {};
      data.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!daily[date]) {
          daily[date] = {
            temp: item.main.temp,
            icon: item.weather[0].icon,
          };
        }
      });

      this.forecast = Object.keys(daily).map((date) => ({
        date,
        temp: daily[date].temp,
        icon: daily[date].icon,
      }));

      this.cacheForecastData(this.forecast);
    });
  }

  cacheWeatherData(data: any) {
    localStorage.setItem('weatherData', JSON.stringify(data));
  }

  async loadOfflineData(lat: number, lon: number) {
    const status = await Network.getStatus();
    if (!status.connected) {
      const cachedData = localStorage.getItem('weatherData');
      const cachedForecast = localStorage.getItem('forecastData');
      if (cachedData && cachedForecast) {
        this.weather = JSON.parse(cachedData);
        this.forecast = JSON.parse(cachedForecast);
        this.alertUserOffline();
      } else {
        this.alertUserNoNetwork();
      }
    } else {
      this.getWeather(lat, lon);
      this.getForecast(lat, lon);
    }
  }

  async alertUserOffline() {
    const alert = await this.alertCtrl.create({
      header: 'Offline Mode',
      message: 'You are offline. Weather information is being displayed from cached data.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  async alertUserNoNetwork() {
    const alert = await this.alertCtrl.create({
      header: 'Network Error',
      message: 'You are offline and there is no cached data available. Please connect to a network.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  cacheForecastData(forecast: any) {
    localStorage.setItem('forecastData', JSON.stringify(forecast));
  }

  toggleTemperatureUnit() {
    this.isCelsius = !this.isCelsius;
    if (this.weather?.coord) {
      const { lat, lon } = this.weather.coord;
      this.getWeather(lat, lon);
      this.getForecast(lat, lon);
    }
  }

  searchCity() {
    if (!this.searchQuery.trim()) return;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.searchQuery)}`;
    this.http.get<any[]>(url).subscribe((results) => {
      if (results.length > 0) {
        const { lat, lon } = results[0];
        const parsedLat = parseFloat(lat);
        const parsedLon = parseFloat(lon);
        this.map.setView([parsedLat, parsedLon], 13);

        if (this.userMarker) this.map.removeLayer(this.userMarker);
        this.userMarker = L.marker([parsedLat, parsedLon]).addTo(this.map)
          .bindPopup(`You searched for: ${this.searchQuery}`)
          .openPopup();

        this.getWeather(parsedLat, parsedLon);
        this.getForecast(parsedLat, parsedLon);
      }
    });
  }

  toggleLightMode(event: any) {
    const lightMode = event.detail.checked;
    if (lightMode) {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    }
  }

  async showOfflineNotification() {
    const alert = await this.alertCtrl.create({
      header: 'Offline Mode',
      message: 'You are currently offline. Please connect to a network to gather weather information.',
      buttons: ['OK'],
    });
    await alert.present();
  }
}
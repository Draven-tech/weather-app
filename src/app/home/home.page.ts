import { Component } from '@angular/core';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  map!: L.Map;
  weather: any;
  forecast: any[] = [];
  apiKey = '718989f262a375b4a2dafb98323ef8c1';
  searchQuery = '';
  isCelsius = true;
  sunriseTime = '';
  sunsetTime = '';

  constructor(private http: HttpClient) {}

  ngAfterViewInit() {
    this.loadMap();
  }

  loadMap() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
  
        this.map = L.map('map').setView([latitude, longitude], 13);
  
        // Use Esri Satellite for a satellite view
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '&copy; Esri & contributors'
        }).addTo(this.map);
  
        const customIcon = L.icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });
  
        L.marker([latitude, longitude], { icon: customIcon }).addTo(this.map)
          .bindPopup('You are here!')
          .openPopup();
  
        this.getWeather(latitude, longitude);
      },
      (error) => {
        console.error('Geolocation error:', error);
      }
    );
  }  

  initializeMap(lat: number, lon: number) {
    this.map = L.map('map').setView([lat, lon], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    const customIcon = L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    L.marker([lat, lon], { icon: customIcon }).addTo(this.map)
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
    });
  }

  getForecast(lat: number, lon: number) {
    const unit = this.isCelsius ? 'metric' : 'imperial';
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${this.apiKey}`;

    this.http.get(url).subscribe((data: any) => {
      const dailyData: any = {};
      data.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!dailyData[date]) {
          dailyData[date] = {
            temp: item.main.temp,
            icon: item.weather[0].icon,
          };
        }
      });

      this.forecast = Object.keys(dailyData).map((date) => ({
        date,
        temp: dailyData[date].temp,
        icon: dailyData[date].icon,
      }));
    });
  }

  toggleTemperatureUnit() {
    this.isCelsius = !this.isCelsius;
    if (this.weather) {
      this.getWeather(this.weather.coord.lat, this.weather.coord.lon);
      this.getForecast(this.weather.coord.lat, this.weather.coord.lon);
    }
  }


  searchCity() {
    if (!this.searchQuery.trim()) return;
  
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.searchQuery)}`;
  
    this.http.get<any[]>(url).subscribe((results) => {
      if (results.length > 0) {
        const { lat, lon } = results[0];
  
        this.map.setView([lat, lon], 13); // Move map to searched location
  
        L.marker([lat, lon]).addTo(this.map)
          .bindPopup(`You searched for: ${this.searchQuery}`)
          .openPopup();
  
        this.getWeather(parseFloat(lat), parseFloat(lon)); // Update weather
      }
    }, (error) => {
      console.error("Error searching location:", error);
    });
  }
  

  toggleLightMode(event: any) {
    const lightMode = event.detail.checked;
  
    if (lightMode) {
      document.body.classList.add('light-theme'); // Switch to light
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-theme'); // Switch to dark
      localStorage.setItem('theme', 'dark');
    }
  }
  
  // Apply theme on load
  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
    }
  }
}

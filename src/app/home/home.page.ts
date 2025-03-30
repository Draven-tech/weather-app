import { Component } from '@angular/core';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-home',
  standalone: true, // Ensure this is standalone
  imports: [CommonModule, IonicModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  map!: L.Map;
  weather: any;
  apiKey = '718989f262a375b4a2dafb98323ef8c1';

  constructor(private http: HttpClient) {}

  ngAfterViewInit() {
    this.loadMap();
  }

  loadMap() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        this.map = L.map('map').setView([latitude, longitude], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
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

        L.marker([latitude, longitude]).addTo(this.map)
          .bindPopup('You are here!')
          .openPopup();

        this.getWeather(latitude, longitude);
      },
      (error) => {
        console.error('Geolocation error:', error);
      }
    );
  }

  getWeather(lat: number, lon: number) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`;
  
    this.http.get(url).subscribe((data) => {
      this.weather = data; // Store the weather data
      console.log("Weather Data Received:", this.weather); // Log data to confirm
    }, (error) => {
      console.error("Error fetching weather data:", error);
    });
  }  

}

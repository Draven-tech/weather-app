import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Geolocation } from '@capacitor/geolocation';
import { Network } from '@capacitor/network';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ThemeService } from '../services/theme.service';

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
  loading = false;
  isDarkMode = false;
  alertEnabled = localStorage.getItem('alertsEnabled') !== 'false';

  constructor(
    private http: HttpClient,
    private alertCtrl: AlertController,
    private menuCtrl: MenuController,
    private router: Router,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    const storedTheme = this.themeService.getDarkMode();
    this.isDarkMode = storedTheme !== null ? storedTheme : false;
    this.themeService.applyTheme(this.isDarkMode);
  }
  
  ngAfterViewInit() {
    this.loadMap();
  }


  toggleLightMode(event: any) {
    this.themeService.toggleDarkMode(event.detail.checked);
    this.isDarkMode = event.detail.checked;
    localStorage.setItem('darkMode', JSON.stringify(this.isDarkMode));
  }

  openMenu() {
    this.menuCtrl.open();
  }

  async loadMap() {
    this.loading = true;

    const status = await Network.getStatus();
    const hasInternet = await this.hasInternetAccess();

    if (!status.connected || !hasInternet) {
      const alert = await this.alertCtrl.create({
        header: 'Offline Mode',
        message: 'You are currently offline. Would you like to go to offline mode?',
        buttons: [
          { text: 'Cancel', role: 'cancel' },
          {
            text: 'Yes',
            handler: () => this.router.navigate(['/offline-mode']),
          },
        ],
      });
      await alert.present();
      this.loading = false;
      return;
    }

    try {
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });

      const lat = coordinates.coords.latitude;
      const lon = coordinates.coords.longitude;

      this.initializeMap(lat, lon);
      this.addUserMarker(lat, lon);
      this.getWeather(lat, lon);
      this.getForecast(lat, lon);
    } catch (err) {
      const alert = await this.alertCtrl.create({
        header: 'Location Error',
        message: 'We couldn’t fetch your current location. Please check your location settings.',
        buttons: ['OK'],
      });
      await alert.present();
    } finally {
      this.loading = false;
    }
  }

  async hasInternetAccess(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Cebu&appid=${this.apiKey}`, {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeout);
      return response.status === 200;
    } catch {
      return false;
    }
  }

  initializeMap(lat: number, lon: number) {
    if (this.map) this.map.remove();

    this.map = L.map('map').setView([lat, lon], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);
  }

  addUserMarker(lat: number, lon: number) {
    const icon = L.icon({
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    if (this.userMarker) {
      this.map.removeLayer(this.userMarker);
    }

    this.userMarker = L.marker([lat, lon], { icon }).addTo(this.map)
      .bindPopup('Your current location')
      .openPopup();
  }

  getWeather(lat: number, lon: number) {
    const unit = this.isCelsius ? 'metric' : 'imperial';
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${this.apiKey}`;

    this.http.get(url).subscribe((data: any) => {
      this.weather = data;
      this.sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
      this.sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString();
      localStorage.setItem('weatherData', JSON.stringify(this.weather));

      if (this.alertEnabled) {
        const weatherMain = data.weather[0]?.main.toLowerCase();
        const severeConditions = ['thunderstorm', 'tornado', 'extreme', 'ash', 'squall'];
        if (severeConditions.includes(weatherMain)) {
          this.showSevereAlert(weatherMain);
        }
      }
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
    });
  }

  toggleTemperatureUnit() {
    this.isCelsius = !this.isCelsius;
    if (this.weather?.coord) {
      const { lat, lon } = this.weather.coord;
      this.getWeather(lat, lon);
      this.getForecast(lat, lon);
    }
  }

  toggleAlerts(event: any) {
    this.alertEnabled = event.detail.checked;
    localStorage.setItem('alertsEnabled', this.alertEnabled.toString());
  }

  searchCity() {
    if (!this.searchQuery.trim()) return;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.searchQuery)}`;

    this.http.get<any[]>(url).subscribe((results) => {
      if (results.length > 0) {
        const parsedLat = parseFloat(results[0].lat);
        const parsedLon = parseFloat(results[0].lon);
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

  async showSevereAlert(condition: string) {
    const alert = await this.alertCtrl.create({
      header: 'Severe Weather Alert',
      message: `A severe weather condition has been detected: <strong>${condition}</strong>. Stay safe!`,
      buttons: ['OK'],
    });
    await alert.present();
  }
}

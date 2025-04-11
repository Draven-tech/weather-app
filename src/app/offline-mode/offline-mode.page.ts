import { Component, OnInit } from '@angular/core';
import { Network } from '@capacitor/network';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../services/theme.service'; 
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-offline-mode',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './offline-mode.page.html',
  styleUrls: ['./offline-mode.page.scss'],
})
export class OfflineModePage implements OnInit {
  weather: any = null;
  isCelsius = true;
  sunriseTime = '';
  sunsetTime = '';
  loading = false;
  apiKey = '718989f262a375b4a2dafb98323ef8c1';
  networkStatus: any;
  isDarkMode = false;

  constructor(
    private http: HttpClient,
    private alertCtrl: AlertController,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.isDarkMode = this.themeService.getDarkMode();
    this.themeService.applyTheme(this.isDarkMode);
  
    this.checkNetworkStatus();
  
    Network.addListener('networkStatusChange', (status) => {
      this.networkStatus = status;
      if (status.connected) {
        this.loadWeatherFromAPI();
      } else {
        this.loadWeatherFromCache();
        this.showOfflineNotification();
      }
    });
  }

  async checkNetworkStatus() {
    this.networkStatus = await Network.getStatus();
    if (this.networkStatus.connected) {
      this.loadWeatherFromAPI();
    } else {
      this.loadWeatherFromCache();
      this.showOfflineNotification();
    }
  }

  loadWeatherFromAPI() {
    this.loading = true;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=London&units=metric&appid=${this.apiKey}`;
    this.http.get(url).subscribe((data: any) => {
      this.weather = data;
      this.sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
      this.sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString();
      localStorage.setItem('weatherData', JSON.stringify(this.weather));
      this.loading = false;
    }, error => {
      this.loading = false;
      this.showOfflineNotification();
    });
  }

  loadWeatherFromCache() {
    const cachedWeather = localStorage.getItem('weatherData');
    if (cachedWeather) {
      this.weather = JSON.parse(cachedWeather);
      this.sunriseTime = new Date(this.weather.sys.sunrise * 1000).toLocaleTimeString();
      this.sunsetTime = new Date(this.weather.sys.sunset * 1000).toLocaleTimeString();
    } else {
      this.loading = false;
      this.showOfflineNotification();
    }
  }

  async showOfflineNotification() {
    const alert = await this.alertCtrl.create({
      header: 'Offline Mode',
      message: 'You are currently offline. Some features may not be available.',
      buttons: ['OK']
    });
    await alert.present();
  }


  toggleLightMode(event: any) {
    this.themeService.toggleDarkMode(event.detail.checked);
    this.isDarkMode = event.detail.checked;
  }
}

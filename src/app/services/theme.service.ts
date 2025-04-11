import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {

  constructor() {}

  getDarkMode(): boolean {
    const storedTheme = localStorage.getItem('darkMode');
    return storedTheme ? JSON.parse(storedTheme) : false;
  }

  toggleDarkMode(isDarkMode: boolean) {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    this.applyTheme(isDarkMode);
  }

  applyTheme(isDarkMode: boolean) {
    const body = document.body;
    if (isDarkMode) {
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
    } else {
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
    }
  }  
}

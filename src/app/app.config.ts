import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';

export const appConfig = {
  providers: [
    provideRouter(routes),         // ← هنا الـ Router
    provideHttpClient(),           // لو عندك HttpClient
    importProvidersFrom(BrowserModule)
  ]
};

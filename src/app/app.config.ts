import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { AuthInterceptor } from './core/services/auth.interceptor';

export const appConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(BrowserModule),

    provideHttpClient(
      withInterceptors([
        AuthInterceptor
      ])
    )

  ]
};

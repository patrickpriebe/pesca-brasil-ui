import { ApplicationConfig, ErrorHandler, provideAppInitializer, inject } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import * as Sentry from '@sentry/angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),

    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler(),
    },
    {
      provide: Sentry.TraceService,
      deps: [Router],
    },

    provideAppInitializer(() => {
      inject(Sentry.TraceService);
    }),
  ],
};

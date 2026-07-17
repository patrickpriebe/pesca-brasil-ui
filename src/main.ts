import { bootstrapApplication } from '@angular/platform-browser';
import * as Sentry from '@sentry/angular';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';

Sentry.init({
  dsn: 'https://72487388b4338a53902f7a0d7d94b01e@o4511747664707584.ingest.us.sentry.io/4511747672637440',
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  tracesSampleRate: 1.0,

  tracePropagationTargets: ['localhost', /^https:\/\/pesca-brasil-api\.onrender\.com/],

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));

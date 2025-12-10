import { ApplicationConfig, provideZoneChangeDetection, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import localeSl from '@angular/common/locales/sl';
import { registerLocaleData } from '@angular/common';
import { MAT_PAGINATOR_INTL_PROVIDER } from './core/i18n/sl-paginator-intl';

import { routes } from './app.routes';

// Register Slovenian locale data for pipes (date, currency, numbers)
registerLocaleData(localeSl);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    { provide: LOCALE_ID, useValue: 'sl' },
    MAT_PAGINATOR_INTL_PROVIDER,
  ],
};

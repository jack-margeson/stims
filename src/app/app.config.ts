import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  HttpEvent,
  HttpHandlerFn,
  HttpHeaderResponse,
  HttpRequest,
  HttpResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { Observable, tap } from 'rxjs';

// const loggingInterceptor = (
//   req: HttpRequest<any>,
//   next: HttpHandlerFn
// ): Observable<HttpEvent<any>> => {
//   return next(req).pipe(
//     tap((event) => {
//       if (
//         event instanceof HttpResponse ||
//         event instanceof HttpHeaderResponse
//       ) {
//         console.log('HTTP Response:', event);
//       }
//     })
//   );
// };

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
    // withInterceptors([loggingInterceptor])
  ],
};

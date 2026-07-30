import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, isDevMode } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

const FALLBACK_ERROR = 'Ocurrió un error al comunicarse con el servidor.';

export function getApiErrorMessage(error: HttpErrorResponse): string {
  const body: unknown = error.error;

  if (typeof body === 'string' && body.trim()) {
    return body.trim();
  }

  if (body && typeof body === 'object') {
    const response = body as Record<string, unknown>;

    if (typeof response['message'] === 'string' && response['message'].trim()) {
      return response['message'].trim();
    }

    if (typeof response['title'] === 'string' && response['title'].trim()) {
      return response['title'].trim();
    }

    const validationErrors = response['errors'];
    if (validationErrors && typeof validationErrors === 'object') {
      const messages = Object.values(validationErrors as Record<string, unknown>)
        .flatMap((value) => (Array.isArray(value) ? value : [value]))
        .filter((value): value is string => typeof value === 'string' && Boolean(value.trim()));

      if (messages.length) {
        return messages.join(' ');
      }
    }
  }

  if (error.status === 0) {
    return 'No se pudo conectar con el servidor.';
  }

  return FALLBACK_ERROR;
}

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const snackBar = inject(MatSnackBar);
  const requestWithCommonHeaders = request.clone({
    setHeaders: { Accept: 'application/json' },
  });

  return next(requestWithCommonHeaders).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      const message = getApiErrorMessage(error);
      snackBar.open(message, 'Cerrar', {
        duration: 6000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        politeness: 'assertive',
      });

      if (isDevMode()) {
        console.error(`[HTTP ${error.status || 'network'}] ${request.method} ${request.url}`, error);
      }

      return throwError(() => error);
    }),
  );
};

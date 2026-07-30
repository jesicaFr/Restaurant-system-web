import { HttpErrorResponse } from '@angular/common/http';
import { getApiErrorMessage } from './api-error.interceptor';

describe('getApiErrorMessage', () => {
  it('returns a plain-text API response', () => {
    const error = new HttpErrorResponse({
      status: 409,
      error: 'Ya existe una mesa con ese número.',
    });

    expect(getApiErrorMessage(error)).toBe('Ya existe una mesa con ese número.');
  });

  it('returns the message from an object response', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { message: 'La mesa está ocupada.' },
    });

    expect(getApiErrorMessage(error)).toBe('La mesa está ocupada.');
  });

  it('combines ASP.NET validation errors', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: {
        errors: {
          Number: ['El número es obligatorio.'],
          Capacity: ['La capacidad debe ser mayor que uno.'],
        },
      },
    });

    expect(getApiErrorMessage(error)).toBe(
      'El número es obligatorio. La capacidad debe ser mayor que uno.',
    );
  });

  it('returns a connection message for network errors', () => {
    const error = new HttpErrorResponse({ status: 0 });

    expect(getApiErrorMessage(error)).toBe('No se pudo conectar con el servidor.');
  });
});

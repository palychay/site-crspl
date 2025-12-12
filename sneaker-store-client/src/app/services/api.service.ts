import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  protected apiUrl = environment.apiUrl;

  constructor(protected http: HttpClient) {}

  protected handleError(error: HttpErrorResponse) {
    let errorMessage = 'Произошла ошибка';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Ошибка: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || 'Неверный запрос';
          break;
        case 401:
          errorMessage = 'Не авторизован';
          break;
        case 403:
          errorMessage = 'Доступ запрещен';
          break;
        case 404:
          errorMessage = 'Ресурс не найден';
          break;
        case 500:
          errorMessage = 'Ошибка сервера';
          break;
        default:
          errorMessage = `Ошибка ${error.status}: ${error.message}`;
      }
    }
    
    return throwError(() => ({ message: errorMessage, status: error.status }));
  }
}
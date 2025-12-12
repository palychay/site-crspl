import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  
  constructor(private notificationService: NotificationService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Произошла ошибка';
        let errorTitle = 'Ошибка';
        
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Ошибка на клиенте: ${error.error.message}`;
        } else {
          // Server-side error
          switch (error.status) {
            case 0:
              errorTitle = 'Ошибка подключения';
              errorMessage = 'Не удалось подключиться к серверу. Проверьте интернет соединение или запущен ли сервер.';
              break;
            case 400:
              errorTitle = 'Неверный запрос';
              errorMessage = error.error?.message || 'Некорректные данные в запросе';
              break;
            case 401:
              errorTitle = 'Ошибка авторизации';
              errorMessage = error.error?.message || 'Неверный логин или пароль';
              // Не показываем уведомление для ошибок авторизации - их обработаем в компоненте
              // return throwError(() => error);
              break;
            case 403:
              errorTitle = 'Доступ запрещен';
              errorMessage = error.error?.message || 'У вас недостаточно прав для выполнения этого действия';
              break;
            case 404:
              errorTitle = 'Ресурс не найден';
              errorMessage = error.error?.message || 'Запрашиваемый ресурс не найден';
              break;
            case 500:
              errorTitle = 'Ошибка сервера';
              errorMessage = 'Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.';
              break;
            default:
              errorMessage = `Ошибка ${error.status}: ${error.message}`;
          }
        }
        
        // Показываем уведомление для всех ошибок кроме 401 (авторизация)
        if (error.status !== 401) {
          this.notificationService.error(errorMessage, errorTitle);
        }
        
        return throwError(() => error);
      })
    );
  }
}
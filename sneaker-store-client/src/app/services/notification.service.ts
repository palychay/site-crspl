import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notifications.asObservable();
  private idCounter = 0;

  constructor(private zone: NgZone) {} // Добавляем NgZone

  getNotifications(): Notification[] {
    return this.notifications.value;
  }

  show(notification: Omit<Notification, 'id'>) {
    const id = ++this.idCounter;
    const newNotification = { ...notification, id };
    
    // ВАЖНО: Запускаем в зоне Angular для автоматического обнаружения изменений
    this.zone.run(() => {
      const current = this.notifications.value;
      this.notifications.next([...current, newNotification]);
    });
    
    // Автоудаление через заданное время
    if (notification.duration !== 0) {
      setTimeout(() => {
        this.remove(id);
      }, notification.duration || 5000);
    }
    
    return id;
  }

  remove(id: number) {
    this.zone.run(() => {
      const current = this.notifications.value;
      this.notifications.next(current.filter(n => n.id !== id));
    });
  }

  clear() {
    this.zone.run(() => {
      this.notifications.next([]);
    });
  }

  success(message: string, title?: string, duration?: number) {
    return this.show({
      type: 'success',
      title: title || 'Успешно',
      message,
      duration
    });
  }

  error(message: string, title?: string, duration?: number) {
    return this.show({
      type: 'error',
      title: title || 'Ошибка',
      message,
      duration: duration || 8000
    });
  }

  info(message: string, title?: string, duration?: number) {
    return this.show({
      type: 'info',
      title: title || 'Информация',
      message,
      duration
    });
  }

  warning(message: string, title?: string, duration?: number) {
    return this.show({
      type: 'warning',
      title: title || 'Предупреждение',
      message,
      duration
    });
  }
}
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="position-fixed top-0 end-0 p-3" style="z-index: 9999">
      @if (notifications && notifications.length > 0) {
        @for (notification of notifications; track notification.id) {
          <div class="toast show mb-3"
               [class]="getToastClass(notification.type)"
               role="alert">
            <div class="toast-header">
              <i [class]="'fa me-2 ' + getIconClass(notification.type)"></i>
              <strong class="me-auto">{{ notification.title }}</strong>
              <button type="button" 
                      class="btn-close" 
                      (click)="close(notification.id)"
                      aria-label="Close"></button>
            </div>
            <div class="toast-body">
              {{ notification.message }}
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .toast {
      min-width: 300px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      animation: slideIn 0.3s ease-out;
    }
    
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: any[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  close(id: number) {
    this.notificationService.remove(id);
  }

  getToastClass(type: string): string {
    switch(type) {
      case 'success': return 'bg-success text-white';
      case 'error': return 'bg-danger text-white';
      case 'warning': return 'bg-warning';
      case 'info': return 'bg-info text-dark';
      default: return 'bg-light';
    }
  }

  getIconClass(type: string): string {
    switch(type) {
      case 'success': return 'fa-check-circle';
      case 'error': return 'fa-exclamation-triangle';
      case 'warning': return 'fa-exclamation-circle';
      case 'info': return 'fa-info-circle';
      default: return 'fa-bell';
    }
  }
}
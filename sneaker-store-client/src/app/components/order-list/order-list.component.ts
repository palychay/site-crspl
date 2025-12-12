import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { Order, OrderStatus } from '../../models/order.model';
import { PriceFormatPipe } from '../../pipes/price-format.pipe';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, PriceFormatPipe],
  template: `
    <div class="container mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4>
          <i class="fa fa-list-alt me-2"></i>Всего заказов
        </h4>
        <div class="badge bg-primary">Администратор</div>
      </div>

      @if (errorMessage) {
        <div class="alert alert-danger mb-3">
          <i class="fa fa-exclamation-triangle me-2"></i>{{ errorMessage }}
        </div>
      }

      @if (isLoading) {
        <div class="text-center my-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Загрузка...</span>
          </div>
          <p class="mt-2 text-muted">Загрузка заказов...</p>
        </div>
      } @else {
        @if (orders.length > 0) {
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>№</th>
                  <th>Дата</th>
                  <th>Клиент</th>
                  <th>Email</th>
                  <th>Телефон</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                  <th>Адрес доставки</th>
                </tr>
              </thead>
              <tbody>
                @for (order of orders; track order.id) {
                  <tr>
                    <td><strong>#{{order.id}}</strong></td>
                    <td>{{order.orderDate | date:'dd.MM.yyyy HH:mm'}}</td>
                    <td>{{order.customerName}}</td>
                    <td>{{order.customerEmail}}</td>
                    <td>{{order.customerPhone || 'Не указан'}}</td>
                    <td class="text-success fw-bold">{{order.totalAmount | priceFormat }}</td>
                    <td>
                      <span [class]="getStatusBadgeClass(order.status)">
                        {{order.status}}
                      </span>
                    </td>
                    <td class="small">{{order.shippingAddress}}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          
          <div class="mt-3 text-muted small">
            <i class="fa fa-info-circle me-1"></i> Всего заказов: {{orders.length}}
          </div>
        } @else if (!errorMessage) {
          <div class="text-center py-5">
            <div class="card">
              <div class="card-body py-5">
                <i class="fa fa-shopping-cart fa-4x text-muted mb-4"></i>
                <h5 class="card-title">Заказов пока нет</h5>
                <p class="card-text">Когда клиенты будут делать заказы, они появятся здесь.</p>
                <a routerLink="/sneakers" class="btn btn-primary">
                  <i class="fa fa-shopping-bag me-1"></i>Перейти к товарам
                </a>
              </div>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .status-badge {
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.85em;
      font-weight: 500;
    }
    .status-pending { background-color: #ffeb3b; color: #333; }
    .status-processing { background-color: #2196f3; color: white; }
    .status-shipped { background-color: #4caf50; color: white; }
    .status-delivered { background-color: #8bc34a; color: white; }
    .status-cancelled { background-color: #f44336; color: white; }
  `]
})
export class OrderListComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  isLoading = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  constructor(
    private orderService: OrderService,
    public authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrders(forceRefresh = false): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.orderService.getOrders(forceRefresh)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (orders) => {
          this.orders = orders;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = 'Не удалось загрузить заказы';
          
          if (error.status === 401) {
            this.authService.logout();
            this.router.navigate(['/login']);
          } else if (error.status === 403) {
            this.errorMessage = 'У вас недостаточно прав для просмотра заказов';
            this.router.navigate(['/dashboard']);
          }
          this.orders = [];
          this.cdr.detectChanges();
        }
      });
  }

  getStatusBadgeClass(status: OrderStatus): string {
    const statusMap = {
      [OrderStatus.Pending]: 'status-badge status-pending',
      [OrderStatus.Processing]: 'status-badge status-processing',
      [OrderStatus.Shipped]: 'status-badge status-shipped',
      [OrderStatus.Delivered]: 'status-badge status-delivered',
      [OrderStatus.Cancelled]: 'status-badge status-cancelled'
    };
    return statusMap[status] || 'status-badge';
  }
}
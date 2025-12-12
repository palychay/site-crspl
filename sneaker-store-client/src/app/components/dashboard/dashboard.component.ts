import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SneakerService } from '../../services/sneaker.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { PriceFormatPipe } from '../../pipes/price-format.pipe';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, PriceFormatPipe],
  template: `
    <div class="container-fluid mt-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="mb-0">
          <i class="fa fa-dashboard me-2"></i>Панель управления
        </h4>
        <div class="badge bg-primary">Администратор</div>
      </div>

      @if (errorMessage) {
        <div class="alert alert-danger mb-3">
          <i class="fa fa-exclamation-triangle me-2"></i>{{ errorMessage }}
        </div>
      }

      <div class="row mb-4">
        <div class="col-md-3">
          <div class="card bg-primary text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="card-title">Всего кроссовок</h6>
                  <h3 class="mb-0">{{ stats.totalSneakers || 0 }}</h3>
                </div>
                <i class="fa fa-shopping-bag fa-2x"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card bg-success text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="card-title">Всего заказов</h6>
                  <h3 class="mb-0">{{ stats.totalOrders || 0 }}</h3>
                </div>
                <i class="fa fa-list-alt fa-2x"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card bg-warning text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="card-title">Общая выручка</h6>
                  <h3 class="mb-0">{{ (stats.totalRevenue || 0) | priceFormat }}</h3>
                </div>
                <i class="fa fa-money fa-2x"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card bg-info text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="card-title">В наличии</h6>
                  <h3 class="mb-0">{{ stats.inStock || 0 }}</h3>
                </div>
                <i class="fa fa-check-circle fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0"><i class="fa fa-bolt me-2"></i>Быстрые действия</h6>
            </div>
            <div class="card-body">
              <div class="d-flex flex-wrap gap-2">
                <button class="btn btn-primary" routerLink="/sneakers/new">
                  <i class="fa fa-plus me-1"></i>Добавить кроссовки
                </button>
                <button class="btn btn-success" routerLink="/sneakers">
                  <i class="fa fa-eye me-1"></i>Просмотр каталога
                </button>
                <button class="btn btn-warning" routerLink="/orders">
                  <i class="fa fa-list me-1"></i>Просмотр заказов
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0"><i class="fa fa-clock-o me-2"></i>Последние заказы</h6>
            </div>
            <div class="card-body">
              @if (recentOrders.length > 0) {
                <div class="table-responsive">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>№</th>
                        <th>Клиент</th>
                        <th>Дата</th>
                        <th>Сумма</th>
                        <th>Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (order of recentOrders; track order.id) {
                        <tr>
                          <td>#{{order.id}}</td>
                          <td>{{order.customerName}}</td>
                          <td>{{order.orderDate | date:'dd.MM.yyyy'}}</td>
                          <td class="text-success">{{order.totalAmount | priceFormat}}</td>
                          <td>
                            <span [class]="getStatusBadgeClass(order.status)">
                              {{order.status}}
                            </span>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              } @else if (!errorMessage) {
                <p class="text-muted text-center py-3">Заказов пока нет</p>
              }
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0"><i class="fa fa-pie-chart me-2"></i>Топ бренды</h6>
            </div>
            <div class="card-body">
              @if (brandStats.length > 0) {
                <div class="list-group">
                  @for (brand of brandStats; track brand.brand; let i = $index) {
                    <div class="list-group-item d-flex justify-content-between align-items-center">
                      <span>{{i + 1}}. {{brand.brand}}</span>
                      <span class="badge bg-primary rounded-pill">{{brand.count}}</span>
                    </div>
                  }
                </div>
              } @else if (!errorMessage) {
                <p class="text-muted text-center py-3">Нет данных</p>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .status-badge {
      padding: 3px 8px;
      border-radius: 15px;
      font-size: 0.8em;
    }
    .status-pending { background-color: #ffeb3b; color: #333; }
    .status-processing { background-color: #2196f3; color: white; }
    .status-shipped { background-color: #4caf50; color: white; }
    .status-delivered { background-color: #8bc34a; color: white; }
    .status-cancelled { background-color: #f44336; color: white; }
  `]
})
export class DashboardComponent implements OnInit {
  stats: any = { totalSneakers: 0, totalOrders: 0, totalRevenue: 0, inStock: 0 };
  recentOrders: any[] = [];
  brandStats: any[] = [];
  errorMessage = '';
  isLoading = true;

  constructor(
    private sneakerService: SneakerService,
    private orderService: OrderService,
    public authService: AuthService,
    private cdr: ChangeDetectorRef // Добавляем ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.errorMessage = '';
    this.isLoading = true;

    // Используем forkJoin для параллельной загрузки
    forkJoin({
      sneakers: this.sneakerService.getSneakers(true),
      orders: this.orderService.getOrders()
    }).subscribe({
      next: ({ sneakers, orders }) => {
        // Обрабатываем кроссовки
        this.stats.totalSneakers = sneakers.length;
        this.stats.inStock = sneakers.filter(s => s.stockQuantity > 0).length;
        
        // Статистика по брендам
        const brandMap = new Map();
        sneakers.forEach(sneaker => {
          brandMap.set(sneaker.brand, (brandMap.get(sneaker.brand) || 0) + 1);
        });
        
        this.brandStats = Array.from(brandMap.entries())
          .map(([brand, count]) => ({ brand, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Обрабатываем заказы
        this.recentOrders = orders.slice(0, 5);
        this.stats.totalOrders = orders.length;
        this.stats.totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        this.isLoading = false;
        
        // ВАЖНО: Запускаем обнаружение изменений!
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.recentOrders = [];
        this.brandStats = [];
        this.isLoading = false;
        
        if (error.status === 500) {
          this.errorMessage = 'Ошибка сервера при загрузке данных. Пожалуйста, попробуйте позже.';
        } else if (error.status === 401) {
          this.authService.logout();
        } else {
          this.errorMessage = 'Не удалось загрузить данные';
        }
        
        // ВАЖНО: Запускаем обнаружение изменений даже при ошибке!
        this.cdr.detectChanges();
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    const statusMap: any = {
      'Pending': 'status-badge status-pending',
      'Processing': 'status-badge status-processing',
      'Shipped': 'status-badge status-shipped',
      'Delivered': 'status-badge status-delivered',
      'Cancelled': 'status-badge status-cancelled'
    };
    return statusMap[status] || 'status-badge';
  }
}
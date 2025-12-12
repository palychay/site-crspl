import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container text-center py-5">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <h1 class="display-4 mb-4">
            <i class="fa fa-shoe-prints text-primary"></i> SneakerStore
          </h1>
          <p class="lead mb-4">Панель администратора для управления кроссовками и заказами</p>
          
          @if (!authService.isAuthenticated()) {
            <div class="card mb-4">
              <div class="card-body">
                <h5 class="card-title">Функционал администратора:</h5>
                <ul class="list-unstyled text-start d-inline-block">
                  <li><i class="fa fa-check text-success me-2"></i>Просмотр и управление кроссовками</li>
                  <li><i class="fa fa-check text-success me-2"></i>Добавление, редактирование и удаление моделей</li>
                  <li><i class="fa fa-check text-success me-2"></i>Просмотр всех заказов</li>
                  <li><i class="fa fa-check text-success me-2"></i>Поиск и фильтрация кроссовок</li>
                </ul>
              </div>
            </div>
            
            <div class="d-grid gap-2 d-sm-flex justify-content-sm-center">
              <button class="btn btn-primary btn-lg px-4 gap-3" routerLink="/login">
                <i class="fa fa-sign-in me-2"></i>Войти в панель управления
              </button>
            </div>
          } @else {
            <div class="card mb-4">
              <div class="card-body">
                <h5 class="card-title">Вы вошли в систему</h5>
                <p class="card-text">Используйте меню навигации для доступа к функциям администратора.</p>
                <div class="d-flex flex-wrap gap-2 justify-content-center">
                  <button class="btn btn-primary" routerLink="/dashboard">
                    <i class="fa fa-dashboard me-1"></i>Панель управления
                  </button>
                  <button class="btn btn-success" routerLink="/sneakers">
                    <i class="fa fa-shopping-bag me-1"></i>Кроссовки
                  </button>
                  <button class="btn btn-warning" routerLink="/orders">
                    <i class="fa fa-list me-1"></i>Заказы
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class HomeComponent {
  constructor(public authService: AuthService) { }
}
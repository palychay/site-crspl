import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginForm: FormGroup;
  registerForm: FormGroup;
  isLoginMode = true;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(3)]]
    });

    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.isLoginMode) {
      this.login();
    } else {
      this.register();
    }
  }

  private login(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const credentials = this.loginForm.value;
      
      this.authService.login(credentials).subscribe({
        next: () => {
          this.isLoading = false;
          this.notificationService.success(
            'Добро пожаловать в панель администратора!', 
            'Вход выполнен успешно'
          );
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          
          let message = 'Произошла ошибка при входе';
          
          if (error.status === 401) {
            message = 'Неверное имя пользователя или пароль';
          } else if (error.status === 0) {
            message = 'Не удалось подключиться к серверу. Убедитесь, что сервер запущен на localhost:5225';
          } else if (error.error?.message) {
            message = error.error.message;
          }
          
          this.notificationService.error(message, 'Ошибка авторизации');
          this.errorMessage = message;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.notificationService.warning(
        'Пожалуйста, заполните все обязательные поля корректно',
        'Ошибка заполнения формы'
      );
    }
  }

  private register(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const userData = this.registerForm.value;
      
      this.authService.register(userData).subscribe({
        next: () => {
          this.isLoading = false;
          this.notificationService.success(
            'Регистрация прошла успешно! Теперь вы можете войти в систему.',
            'Успешная регистрация'
          );
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          
          let message = 'Произошла ошибка при регистрации';
          
          if (error.status === 400) {
            message = 'Пользователь с таким именем или email уже существует';
          } else if (error.status === 0) {
            message = 'Не удалось подключиться к серверу';
          } else if (error.error?.message) {
            message = error.error.message;
          }
          
          this.notificationService.error(message, 'Ошибка регистрации');
          this.errorMessage = message;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.notificationService.warning(
        'Пожалуйста, заполните все поля корректно',
        'Ошибка заполнения формы'
      );
    }
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
    this.loginForm.reset();
    this.registerForm.reset();
    this.cdr.detectChanges();
  }
}
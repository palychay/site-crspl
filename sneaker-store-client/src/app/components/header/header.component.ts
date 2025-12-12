import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {
  showMenu = false;
  showLoginButton = false;
  currentRoute = '';

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute = event.url;
      this.updateVisibility();
    });
    this.updateVisibility();
  }

  private updateVisibility(): void {
    const isLoginPage = this.currentRoute === '/login';
    const isHomePage = this.currentRoute === '/';
    
    this.showMenu = !isLoginPage && !isHomePage;
    this.showLoginButton = !this.authService.isAuthenticated() && !isLoginPage && !isHomePage;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
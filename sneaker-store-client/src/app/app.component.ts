import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { NotificationComponent } from './components/notification/notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    HeaderComponent, 
    FooterComponent,
    NotificationComponent
  ],
  template: `
    <div class="d-flex flex-column min-vh-100">
      <app-header></app-header>
      <main class="flex-grow-1">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
      <app-notifications></app-notifications>
    </div>
  `,
  styles: [`
    main {
      background-color: #f8f9fa;
    }
  `]
})
export class AppComponent {
  title = 'SneakerStore Admin Panel';
}
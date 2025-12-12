import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { SneakerListComponent } from './components/sneaker-list/sneaker-list.component';
import { SneakerFormComponent } from './components/sneaker-form/sneaker-form.component';
import { OrderListComponent } from './components/order-list/order-list.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'sneakers', component: SneakerListComponent, canActivate: [authGuard] },
  { path: 'sneakers/new', component: SneakerFormComponent, canActivate: [authGuard] },
  { path: 'sneakers/edit/:id', component: SneakerFormComponent, canActivate: [authGuard] },
  { path: 'orders', component: OrderListComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
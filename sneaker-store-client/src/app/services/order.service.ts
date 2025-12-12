import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { Order } from '../models/order.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = environment.apiUrl;
  private cache$?: Observable<Order[]>;

  constructor(private http: HttpClient) { }

  getOrders(forceRefresh = false): Observable<Order[]> {
    if (!forceRefresh && this.cache$) {
      return this.cache$;
    }
    
    this.cache$ = this.http.get<Order[]>(`${this.apiUrl}/orders`).pipe(
      shareReplay(1)
    );
    
    return this.cache$;
  }

  getOrder(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/orders/${id}`);
  }

  createOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/orders`, order);
  }

  updateOrderStatus(id: number, status: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/orders/${id}/status`, { status });
  }

  getRevenue(startDate?: Date, endDate?: Date): Observable<any> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate.toISOString());
    if (endDate) params = params.set('endDate', endDate.toISOString());
    
    return this.http.get<any>(`${this.apiUrl}/orders/revenue`, { params });
  }

  clearCache(): void {
    this.cache$ = undefined;
  }
}
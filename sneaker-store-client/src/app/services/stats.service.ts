import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class StatsService extends ApiService {
  
  constructor(http: HttpClient) {
    super(http);
  }

  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/sneakers/report`).pipe(
      catchError(this.handleError)
    );
  }

  getBrandStatistics(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sneakers/statistics`).pipe(
      catchError(this.handleError)
    );
  }

  getRevenueStats(startDate?: Date, endDate?: Date): Observable<any> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate.toISOString());
    if (endDate) params = params.set('endDate', endDate.toISOString());
    
    return this.http.get<any>(`${this.apiUrl}/orders/revenue`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  getLowStockSneakers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sneakers/lowstock`).pipe(
      catchError(this.handleError)
    );
  }
}
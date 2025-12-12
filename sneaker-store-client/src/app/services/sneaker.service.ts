import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, shareReplay } from 'rxjs';
import { Sneaker } from '../models/sneaker.model';

@Injectable({
  providedIn: 'root'
})
export class SneakerService {
  private apiUrl = 'http://localhost:5225/api/sneakers';
  private cache$?: Observable<Sneaker[]>;

  constructor(private http: HttpClient) { }

  getSneakers(forceRefresh = false): Observable<Sneaker[]> {
    if (!forceRefresh && this.cache$) {
      return this.cache$;
    }
    
    this.cache$ = this.http.get<Sneaker[]>(this.apiUrl).pipe(
      shareReplay(1)
    );
    
    return this.cache$;
  }

  getSneaker(id: number): Observable<Sneaker> {
    return this.http.get<Sneaker>(`${this.apiUrl}/${id}`);
  }

  createSneaker(sneaker: Sneaker): Observable<Sneaker> {
    return this.http.post<Sneaker>(this.apiUrl, sneaker);
  }

  updateSneaker(id: number, sneaker: Sneaker): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, sneaker);
  }

  deleteSneaker(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  searchSneakers(params: {
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    minSize?: number;
    maxSize?: number;
  }): Observable<Sneaker[]> {
    let httpParams = new HttpParams();
    
    if (params.brand) httpParams = httpParams.set('brand', params.brand);
    if (params.minPrice) httpParams = httpParams.set('minPrice', params.minPrice.toString());
    if (params.maxPrice) httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
    if (params.minSize) httpParams = httpParams.set('minSize', params.minSize.toString());
    if (params.maxSize) httpParams = httpParams.set('maxSize', params.maxSize.toString());

    return this.http.get<Sneaker[]>(`${this.apiUrl}/search`, { params: httpParams });
  }

  clearCache(): void {
    this.cache$ = undefined;
  }
}
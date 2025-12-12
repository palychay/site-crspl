import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Sneaker } from '../models/sneaker.model';

@Injectable({
  providedIn: 'root'
})
export class SneakerService {
  private apiUrl = 'http://localhost:5225/api/sneakers';
  private sneakersCache = new BehaviorSubject<Sneaker[]>([]);
  private cacheLoaded = false;

  constructor(private http: HttpClient) { }

  getSneakers(forceRefresh = false): Observable<Sneaker[]> {
    if (!forceRefresh && this.cacheLoaded && this.sneakersCache.value.length > 0) {
      return this.sneakersCache.asObservable();
    }
    
    return this.http.get<Sneaker[]>(this.apiUrl).pipe(
      tap(sneakers => {
        this.sneakersCache.next(sneakers);
        this.cacheLoaded = true;
      })
    );
  }

  getSneaker(id: number): Observable<Sneaker> {
    return this.http.get<Sneaker>(`${this.apiUrl}/${id}`);
  }

  createSneaker(sneaker: Sneaker): Observable<Sneaker> {
    return this.http.post<Sneaker>(this.apiUrl, sneaker).pipe(
      tap(() => {
        this.cacheLoaded = false;
      })
    );
  }

  updateSneaker(id: number, sneaker: Sneaker): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, sneaker).pipe(
      tap(() => {
        this.cacheLoaded = false;
      })
    );
  }

  deleteSneaker(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.cacheLoaded = false;
      })
    );
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
    this.cacheLoaded = false;
    this.sneakersCache.next([]);
  }
}
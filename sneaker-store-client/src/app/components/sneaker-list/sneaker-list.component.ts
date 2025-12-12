import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SneakerService } from '../../services/sneaker.service';
import { AuthService } from '../../services/auth.service';
import { Sneaker } from '../../models/sneaker.model';
import { PriceFormatPipe } from '../../pipes/price-format.pipe';

@Component({
  selector: 'app-sneaker-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, DatePipe, PriceFormatPipe],
  templateUrl: './sneaker-list.component.html'
})
export class SneakerListComponent implements OnInit, OnDestroy {
  sneakers: Sneaker[] = [];
  filteredSneakers: Sneaker[] = [];
  viewMode: 'cards' | 'table' = 'cards';
  filterForm: FormGroup;
  sortField = 'name';
  sortDirection = 'asc';
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private sneakerService: SneakerService,
    public authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      brand: [''],
      minPrice: [''],
      maxPrice: [''],
      minSize: [''],
      maxSize: ['']
    });
  }

  ngOnInit(): void {
    this.loadSneakers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSneakers(forceRefresh = false): void {
    this.isLoading = true;
    this.sneakerService.getSneakers(forceRefresh)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sneakers) => {
          this.sneakers = sneakers;
          this.filteredSneakers = [...sneakers];
          this.isLoading = false;
          this.sortSneakers();
        },
        error: (error) => {
          console.error('Error loading sneakers:', error);
          this.isLoading = false;
          if (error.status === 401) {
            this.authService.logout();
            this.router.navigate(['/login']);
          } else {
            this.sneakers = [];
            this.filteredSneakers = [];
          }
        }
      });
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    
    if (filters.brand || filters.minPrice || filters.maxPrice || filters.minSize || filters.maxSize) {
      this.sneakerService.searchSneakers(filters)
        .pipe(takeUntil(this.destroy$))
        .subscribe(sneakers => {
          this.filteredSneakers = sneakers;
          this.sortSneakers();
        });
    } else {
      this.filteredSneakers = [...this.sneakers];
      this.sortSneakers();
    }
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.filteredSneakers = [...this.sneakers];
    this.sortSneakers();
  }

  sortSneakers(): void {
    this.filteredSneakers.sort((a, b) => {
      let valueA: any = a[this.sortField as keyof Sneaker];
      let valueB: any = b[this.sortField as keyof Sneaker];
      
      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = (valueB as string).toLowerCase();
      }
      
      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  sortBy(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.sortSneakers();
  }

  deleteSneaker(id: number): void {
    if (confirm('Вы уверены, что хотите удалить эту модель?')) {
      // Немедленно удаляем из отображения
      this.sneakers = this.sneakers.filter(s => s.id !== id);
      this.filteredSneakers = this.filteredSneakers.filter(s => s.id !== id);
      
      this.sneakerService.deleteSneaker(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Обновляем кэш для будущих загрузок
            this.sneakerService.clearCache();
          },
          error: (error) => {
            console.error('Error deleting sneaker:', error);
            // Если ошибка, перезагружаем данные
            this.loadSneakers(true);
            if (error.status === 401) {
              this.authService.logout();
              this.router.navigate(['/login']);
            } else {
              alert('Ошибка при удалении. Возможно, кроссовка не существует.');
            }
          }
        });
    }
  }

  toggleViewMode(mode: 'cards' | 'table'): void {
    this.viewMode = mode;
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }
}
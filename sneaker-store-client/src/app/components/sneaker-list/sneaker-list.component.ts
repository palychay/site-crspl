import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { SneakerService } from '../../services/sneaker.service';
import { AuthService } from '../../services/auth.service';
import { Sneaker } from '../../models/sneaker.model';
import { PriceFormatPipe } from '../../pipes/price-format.pipe';

@Component({
  selector: 'app-sneaker-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PriceFormatPipe],
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
  errorMessage = '';
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
    
    // Добавляем отслеживание изменений фильтров с задержкой
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.applyFilters();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSneakers(forceRefresh = false): void {
    this.isLoading = true;
    this.errorMessage = '';
    
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
          this.errorMessage = 'Не удалось загрузить кроссовки';
          
          if (error.status === 401) {
            this.authService.logout();
            this.router.navigate(['/login']);
          }
        }
      });
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    
    // Проверяем, есть ли активные фильтры
    const hasActiveFilters = Object.values(filters).some(
      value => value !== null && value !== '' && value !== undefined
    );
    
    if (hasActiveFilters) {
      this.sneakerService.searchSneakers(filters)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (sneakers) => {
            this.filteredSneakers = sneakers;
            this.sortSneakers();
          },
          error: (error) => {
            console.error('Search error:', error);
            this.filteredSneakers = [...this.sneakers];
            this.sortSneakers();
          }
        });
    } else {
      this.filteredSneakers = [...this.sneakers];
      this.sortSneakers();
    }
  }

  resetFilters(): void {
    this.filterForm.reset({
      brand: '',
      minPrice: '',
      maxPrice: '',
      minSize: '',
      maxSize: ''
    });
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
      this.sneakerService.deleteSneaker(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Удаляем из локального массива
            this.sneakers = this.sneakers.filter(s => s.id !== id);
            this.filteredSneakers = this.filteredSneakers.filter(s => s.id !== id);
            // Очищаем кэш
            this.sneakerService.clearCache();
          },
          error: (error) => {
            console.error('Error deleting sneaker:', error);
            alert('Ошибка при удалении. Пожалуйста, попробуйте еще раз.');
            
            if (error.status === 401) {
              this.authService.logout();
              this.router.navigate(['/login']);
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
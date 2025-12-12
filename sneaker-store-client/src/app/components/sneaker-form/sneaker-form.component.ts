import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SneakerService } from '../../services/sneaker.service';
import { Sneaker } from '../../models/sneaker.model';

@Component({
  selector: 'app-sneaker-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './sneaker-form.component.html'
})
export class SneakerFormComponent implements OnInit {
  sneakerForm: FormGroup;
  isEditMode = false;
  sneakerId?: number;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private sneakerService: SneakerService
  ) {
    this.sneakerForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      brand: ['', [Validators.required, Validators.maxLength(50)]],
      model: ['', [Validators.required, Validators.maxLength(50)]],
      size: ['', [Validators.required, Validators.min(35), Validators.max(52)]],
      color: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      stockQuantity: ['', [Validators.required, Validators.min(0)]],
      releaseDate: ['', Validators.required],
      isLimitedEdition: [false]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.sneakerId = +params['id'];
        this.loadSneaker(this.sneakerId);
      }
    });
  }

  loadSneaker(id: number): void {
    this.isLoading = true;
    this.sneakerService.getSneaker(id).subscribe({
      next: (sneaker) => {
        const date = new Date(sneaker.releaseDate);
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        const formattedDate = `${year}-${month}-${day}`;
        
        this.sneakerForm.patchValue({
          ...sneaker,
          releaseDate: formattedDate
        });
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.router.navigate(['/sneakers']);
      }
    });
  }

  onSubmit(): void {
    if (this.sneakerForm.valid) {
      this.isLoading = true;
      const sneakerData = this.sneakerForm.value;
      
      sneakerData.releaseDate = new Date(sneakerData.releaseDate);
      
      if (this.isEditMode && this.sneakerId) {
        sneakerData.id = this.sneakerId;
        this.sneakerService.updateSneaker(this.sneakerId, sneakerData).subscribe({
          next: () => {
            this.isLoading = false;
            this.sneakerService.clearCache();
            this.router.navigate(['/sneakers']);
          },
          error: () => {
            this.isLoading = false;
          }
        });
      } else {
        this.sneakerService.createSneaker(sneakerData).subscribe({
          next: () => {
            this.isLoading = false;
            this.sneakerService.clearCache();
            this.router.navigate(['/sneakers']);
          },
          error: () => {
            this.isLoading = false;
          }
        });
      }
    }
  }

  getFieldError(field: string): string {
    const control = this.sneakerForm.get(field);
    if (control?.hasError('required')) return 'Это поле обязательно';
    if (control?.hasError('maxlength')) return 'Слишком длинное значение';
    if (control?.hasError('min')) return 'Значение слишком маленькое';
    if (control?.hasError('max')) return 'Значение слишком большое';
    return '';
  }
}
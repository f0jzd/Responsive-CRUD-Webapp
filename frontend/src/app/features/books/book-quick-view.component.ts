import { Component, Input, Output, EventEmitter, HostListener, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Book } from '../../core/models';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-book-quick-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal d-block" tabindex="-1" role="dialog" style="background-color: rgba(0,0,0,0.5);" (click)="onBackdropClick($event)">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content bg-dark text-light border-secondary">
          <div class="modal-header border-secondary d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <h5 class="modal-title mb-0">{{ book.title }}</h5>
              @if (isCreator()) {
                <span class="badge bg-success text-white small">
                  <i class="fa-solid fa-user-check me-1"></i>Created by you
                </span>
              }
            </div>
            <button type="button" class="btn-close btn-close-white" aria-label="Close" (click)="close.emit()"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-4">
                <img [src]="book.coverImageUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80'" class="img-fluid rounded" alt="Cover" (error)="onImageError($event)">
              </div>
              <div class="col-md-8">
                <p class="text-secondary"><i class="fa-solid fa-user me-2"></i>{{ book.author }}</p>
                <p class="text-secondary small">Registrerad: {{ book.createdAtUtc | date:'mediumDate' }}</p>
                <p class="mt-3" style="white-space: pre-wrap;">{{ book.description || 'Ingen beskrivning tillgänglig.' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BookQuickViewComponent {
  private authService = inject(AuthService);

  @Input() book!: Book;
  @Output() close = new EventEmitter<void>();

  isCreator = computed(() => {
    const user = this.authService.currentUser();
    return !!user && !!this.book && user.id === this.book.creatorId;
  });

  @HostListener('window:keydown.escape')
  onEscape() {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.close.emit();
    }
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80';
  }
}

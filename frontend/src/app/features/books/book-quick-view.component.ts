import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Book } from '../../core/models';

@Component({
  selector: 'app-book-quick-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal d-block" tabindex="-1" role="dialog" style="background-color: rgba(0,0,0,0.5);" (click)="onBackdropClick($event)">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content bg-dark text-light border-secondary">
          <div class="modal-header border-secondary">
            <h5 class="modal-title">{{ book.title }}</h5>
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
  @Input() book!: Book;
  @Output() close = new EventEmitter<void>();

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

import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BookService } from './book.service';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { Book } from '../../core/models';
import { BookQuickViewComponent } from './book-quick-view.component';

@Component({
  selector: 'app-my-books',
  standalone: true,
  imports: [FormsModule, RouterLink, BookQuickViewComponent],
  template: `
    <div class="container py-2">
      <!-- Header Section -->
      <div
        class="row align-items-center mb-4 g-3 card card-body flex-row shadow-sm border rounded-3 p-4 mx-0"
        style="background-color: #161b22; border-color: #30363d !important;"
      >
        <div class="col-md-7">
          <h1 class="h2 fw-bold text-white mb-1">
            <i class="fa-solid fa-bookmark text-primary me-2"></i>Mina böcker
          </h1>
          <p class="text-secondary mb-0">
            Dina personliga bidrag till den gemensamma bokkatalogen.
          </p>
        </div>
        <div class="col-md-5 text-md-end mt-3 mt-md-0">
          <a routerLink="/books/new" class="btn btn-primary btn-lg shadow-sm fw-semibold">
            <i class="fa-solid fa-circle-plus me-2"></i>Lägg till ny bok
          </a>
        </div>
      </div>

      <!-- Search & Filter Bar (Only displayed if user has registered books) -->
      @if (myBooks().length > 0) {
        <div class="row mb-4">
          <div class="col-12 col-md-6 col-lg-5">
            <div class="input-group shadow-sm">
              <span class="input-group-text border-end-0" style="background-color: #21262d; border-color: #30363d;">
                <i class="fa-solid fa-magnifying-glass text-secondary"></i>
              </span>
              <input
                type="text"
                class="form-control border-start-0 ps-0 text-white"
                placeholder="Sök bland dina böcker..."
                [ngModel]="searchTerm()"
                (ngModelChange)="searchTerm.set($event)"
                style="background-color: #0d1117; border-color: #30363d;"
              />
              @if (searchTerm()) {
                <button class="btn btn-outline-secondary" type="button" (click)="searchTerm.set('')">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              }
            </div>
          </div>
          <div class="col-12 col-md-6 col-lg-7 d-flex align-items-center justify-content-md-end mt-2 mt-md-0">
            <span class="text-secondary small">
              Visar <strong class="text-light">{{ filteredBooks().length }}</strong> av <strong class="text-light">{{ myBooks().length }}</strong> egna böcker
            </span>
          </div>
        </div>
      }

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Laddar dina böcker...</span>
          </div>
          <p class="text-secondary mt-2">Hämtar dina bidrag...</p>
        </div>
      } @else if (myBooks().length === 0) {
        <!-- Zero contributions Empty State with CTA -->
        <div class="card card-body text-center py-5 shadow-sm border" style="background-color: #161b22; border-color: #30363d !important;">
          <div class="text-muted mb-3">
            <i class="fa-solid fa-book-medical fs-1 text-primary opacity-75"></i>
          </div>
          <h2 class="h4 text-light fw-bold">Du har inte lagt till några böcker än</h2>
          <p class="text-secondary small mb-4 mx-auto" style="max-width: 500px;">
            Bli en del av gemenskapen genom att dela dina favoritböcker i den gemensamma katalogen!
          </p>
          <div>
            <a routerLink="/books/new" class="btn btn-primary px-4 py-2 shadow-sm fw-semibold">
              <i class="fa-solid fa-plus me-2"></i>Lägg till din första bok
            </a>
          </div>
        </div>
      } @else if (filteredBooks().length === 0) {
        <!-- Search filter Empty State -->
        <div class="card card-body text-center py-5 shadow-sm border" style="background-color: #161b22; border-color: #30363d !important;">
          <div class="text-muted mb-3">
            <i class="fa-solid fa-magnifying-glass fs-1 text-secondary opacity-50"></i>
          </div>
          <h3 class="h5 text-light">Inga böcker matchade din sökning "{{ searchTerm() }}"</h3>
          <p class="text-secondary small">Kontrollera stavningen eller rensa sökfältet.</p>
          <div>
            <button class="btn btn-outline-primary btn-sm" (click)="searchTerm.set('')">
              Rensa sökning
            </button>
          </div>
        </div>
      } @else {
        <!-- Books Grid -->
        <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
          @for (book of filteredBooks(); track book.id) {
            <div class="col">
              <div
                class="card h-100 shadow-sm border book-card"
                style="background-color: #161b22; border-color: #30363d !important; cursor: pointer;"
                role="button"
                tabindex="0"
                (click)="selectedBook.set(book)"
                (keydown.enter)="selectedBook.set(book)"
              >
                <!-- Book Cover -->
                <div class="book-cover-wrapper text-center position-relative overflow-hidden" style="height: 200px; background-color: #0d1117;">
                  @if (book.coverImageUrl) {
                    <img
                      [src]="book.coverImageUrl"
                      [alt]="book.title"
                      class="w-100 h-100 object-fit-cover"
                      (error)="onImageError($event)"
                    />
                  } @else {
                    <div class="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-secondary" style="background-color: #0d1117;">
                      <i class="fa-solid fa-book-bookmark fs-1 opacity-25"></i>
                      <span class="small opacity-75 mt-2">Inget omslag</span>
                    </div>
                  }
                </div>

                <!-- Book Details -->
                <div class="card-body d-flex flex-column p-3">
                  <h2 class="card-title h5 fw-bold text-white mb-1 text-truncate" [title]="book.title">
                    {{ book.title }}
                  </h2>
                  <p class="card-subtitle text-info small fw-semibold mb-2 text-truncate">
                    <i class="fa-solid fa-feather-pointed me-1"></i>{{ book.author }}
                  </p>

                  <div class="text-secondary small mb-2">
                    <i class="fa-regular fa-calendar me-1"></i>
                    <span>Publicerad: {{ book.publicationDate }}</span>
                  </div>

                  @if (book.description) {
                    <p class="card-text text-light opacity-75 small flex-grow-1 line-clamp-3 mb-3">
                      {{ book.description }}
                    </p>
                  } @else {
                    <p class="card-text text-secondary small fst-italic flex-grow-1 mb-3">
                      Ingen beskrivning tillgänglig.
                    </p>
                  }

                  <!-- Card Footer & Inline Actions -->
                  <div class="pt-2 border-top d-flex align-items-center justify-content-between mt-auto" style="border-color: #30363d !important;">
                    <span class="badge bg-success text-white small">
                      <i class="fa-solid fa-user-check me-1"></i>Created by you
                    </span>

                    <div class="btn-group btn-group-sm">
                      <a
                        [routerLink]="['/books', book.id, 'edit']"
                        class="btn btn-outline-info"
                        title="Redigera bok"
                        (click)="$event.stopPropagation()"
                      >
                        <i class="fa-solid fa-pen-to-square me-1"></i>Redigera
                      </a>
                      <button
                        type="button"
                        class="btn btn-outline-danger"
                        (click)="$event.stopPropagation(); requestDeleteBook(book)"
                        title="Radera bok"
                      >
                        <i class="fa-solid fa-trash-can me-1"></i>Radera
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Quick View Modal -->
      @if (selectedBook()) {
        <app-book-quick-view [book]="selectedBook()!" (close)="selectedBook.set(null)"></app-book-quick-view>
      }

      <!-- Delete Confirmation Modal -->
      @if (bookToDelete()) {
        <div
          class="modal d-block"
          tabindex="-1"
          role="dialog"
          style="background-color: rgba(0,0,0,0.6);"
          (click)="onDeleteModalBackdropClick($event)"
        >
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content bg-dark text-light border-danger shadow-lg">
              <div class="modal-header border-secondary">
                <h5 class="modal-title text-danger d-flex align-items-center">
                  <i class="fa-solid fa-triangle-exclamation me-2"></i>Bekräfta borttagning
                </h5>
                <button
                  type="button"
                  class="btn-close btn-close-white"
                  aria-label="Avbryt"
                  [disabled]="isDeleting()"
                  (click)="cancelDelete()"
                ></button>
              </div>
              <div class="modal-body py-4">
                <p class="mb-2">
                  Är du säker på att du vill ta bort <strong class="text-white">"{{ bookToDelete()?.title }}"</strong> från den gemensamma katalogen?
                </p>
                <p class="text-danger small mb-0">
                  <i class="fa-solid fa-circle-info me-1"></i>Denna åtgärd är permanent och kan inte ångras.
                </p>
              </div>
              <div class="modal-footer border-secondary">
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  [disabled]="isDeleting()"
                  (click)="cancelDelete()"
                >
                  Avbryt
                </button>
                <button
                  type="button"
                  class="btn btn-danger d-flex align-items-center"
                  [disabled]="isDeleting()"
                  (click)="confirmDelete()"
                >
                  @if (isDeleting()) {
                    <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    Raderar...
                  } @else {
                    <i class="fa-solid fa-trash-can me-1"></i>Radera bok
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .book-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      border-radius: 0.75rem;
      overflow: hidden;
    }
    .book-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 0.5rem 1.25rem rgba(0, 0, 0, 0.08) !important;
    }
    .line-clamp-3 {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class MyBooksComponent implements OnInit {
  private bookService = inject(BookService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  myBooks = signal<Book[]>([]);
  searchTerm = signal('');
  isLoading = signal(true);
  selectedBook = signal<Book | null>(null);
  bookToDelete = signal<Book | null>(null);
  isDeleting = signal(false);

  filteredBooks = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const all = this.myBooks();
    if (!term) return all;
    return all.filter(
      b =>
        b.title.toLowerCase().includes(term) ||
        b.author.toLowerCase().includes(term) ||
        (b.description && b.description.toLowerCase().includes(term))
    );
  });

  ngOnInit() {
    this.loadMyBooks();
  }

  loadMyBooks() {
    this.isLoading.set(true);
    this.bookService.getMyBooks().subscribe({
      next: data => {
        // Enforce client-side check to guarantee only owned books are presented
        const currentUserId = this.authService.currentUser()?.id;
        const owned = currentUserId ? data.filter(b => b.creatorId === currentUserId) : data;
        this.myBooks.set(owned);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.danger('Kunde inte hämta dina böcker från servern.');
        this.isLoading.set(false);
      }
    });
  }

  requestDeleteBook(book: Book) {
    this.bookToDelete.set(book);
  }

  cancelDelete() {
    this.bookToDelete.set(null);
  }

  onDeleteModalBackdropClick(event: MouseEvent) {
    if (!this.isDeleting() && (event.target as HTMLElement).classList.contains('modal')) {
      this.cancelDelete();
    }
  }

  confirmDelete() {
    const book = this.bookToDelete();
    if (!book) return;

    this.isDeleting.set(true);
    this.bookService.deleteBook(book.id).subscribe({
      next: () => {
        this.myBooks.update(list => list.filter(b => b.id !== book.id));
        this.toast.success(`Boken "${book.title}" har raderats.`);
        this.isDeleting.set(false);
        this.bookToDelete.set(null);
      },
      error: () => {
        this.toast.danger('Kunde inte radera boken. Kontrollera att du har behörighet.');
        this.isDeleting.set(false);
      }
    });
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80';
  }
}

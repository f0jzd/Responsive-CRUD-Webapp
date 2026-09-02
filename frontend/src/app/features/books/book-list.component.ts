import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BookService } from './book.service';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { Book } from '../../core/models';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="container py-2">
      <!-- Hero / Header Section -->
      <div class="row align-items-center mb-4 g-3 card card-body flex-row shadow-sm border rounded-3 p-4 mx-0" style="background-color: #161b22; border-color: #30363d !important;">
        <div class="col-md-7">
          <h1 class="h2 fw-bold text-white mb-1">
            <i class="fa-solid fa-book-bookmark text-primary me-2"></i>Bokkatalog
          </h1>
          <p class="text-secondary mb-0">
            Upptäck, dela och hantera böcker i den gemensamma katalogen.
          </p>
        </div>
        <div class="col-md-5 text-md-end mt-3 mt-md-0">
          <button class="btn btn-primary btn-lg shadow-sm fw-semibold" (click)="navigateToAddBook()">
            <i class="fa-solid fa-circle-plus me-2"></i>Lägg till ny bok
          </button>
        </div>
      </div>

      <!-- Search & Filter Bar -->
      <div class="row mb-4">
        <div class="col-12 col-md-6 col-lg-5">
          <div class="input-group shadow-sm">
            <span class="input-group-text border-end-0" style="background-color: #21262d; border-color: #30363d;">
              <i class="fa-solid fa-magnifying-glass text-secondary"></i>
            </span>
            <input
              type="text"
              class="form-control border-start-0 ps-0 text-white"
              placeholder="Sök på titel eller författare..."
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
            Visar <strong class="text-light">{{ filteredBooks().length }}</strong> av <strong class="text-light">{{ books().length }}</strong> böcker
          </span>
        </div>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Laddar böcker...</span>
          </div>
          <p class="text-secondary mt-2">Hämtar böcker från databasen...</p>
        </div>
      } @else if (filteredBooks().length === 0) {
        <!-- Empty State -->
        <div class="card card-body text-center py-5 shadow-sm border" style="background-color: #161b22; border-color: #30363d !important;">
          <div class="text-muted mb-3">
            <i class="fa-solid fa-book-open fs-1 text-secondary opacity-50"></i>
          </div>
          @if (searchTerm()) {
            <h4 class="h5 text-light">Inga böcker matchade din sökning "{{ searchTerm() }}"</h4>
            <p class="text-secondary small">Prova att söka på något annat eller rensa sökfältet.</p>
            <div>
              <button class="btn btn-outline-primary btn-sm" (click)="searchTerm.set('')">
                Rensa sökning
              </button>
            </div>
          } @else {
            <h4 class="h5 text-light">Bokkatalogen är tom just nu</h4>
            <p class="text-secondary small">Var först med att lägga till en bok i katalogen!</p>
            <div>
              <button class="btn btn-primary" (click)="navigateToAddBook()">
                <i class="fa-solid fa-plus me-1"></i>Lägg till första boken
              </button>
            </div>
          }
        </div>
      } @else {
        <!-- Responsive Book Grid -->
        <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-4">
          @for (book of filteredBooks(); track book.id) {
            <div class="col">
              <div class="card h-100 shadow-sm border book-card transition-all" style="background-color: #161b22; border-color: #30363d !important;">
                <!-- Book Image / Header -->
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

                <!-- Book Body -->
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

                  <!-- Footer / Actions -->
                  <div class="pt-2 border-top d-flex align-items-center justify-content-between mt-auto" style="border-color: #30363d !important;">
                    <span class="badge bg-dark border border-secondary text-secondary small" [title]="'Skapad av ' + (book.creatorEmail || 'Okänd')">
                      <i class="fa-regular fa-user me-1 text-info"></i>
                      {{ book.creatorEmail ? book.creatorEmail.split('@')[0] : 'Användare' }}
                    </span>

                    @if (isCreator(book)) {
                      <div class="btn-group btn-group-sm">
                        <a
                          [routerLink]="['/books', book.id, 'edit']"
                          class="btn btn-outline-info"
                          title="Redigera bok"
                        >
                          <i class="fa-solid fa-pen-to-square me-1"></i>Redigera
                        </a>
                        <button
                          type="button"
                          class="btn btn-outline-danger"
                          (click)="deleteBook(book)"
                          title="Radera bok"
                        >
                          <i class="fa-solid fa-trash-can me-1"></i>Radera
                        </button>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          }
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
export class BookListComponent implements OnInit {
  private bookService = inject(BookService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  books = signal<Book[]>([]);
  searchTerm = signal('');
  isLoading = signal(true);

  filteredBooks = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const all = this.books();
    if (!term) return all;
    return all.filter(
      b =>
        b.title.toLowerCase().includes(term) ||
        b.author.toLowerCase().includes(term) ||
        (b.description && b.description.toLowerCase().includes(term))
    );
  });

  ngOnInit() {
    this.loadBooks();
  }

  loadBooks() {
    this.isLoading.set(true);
    this.bookService.getBooks().subscribe({
      next: data => {
        this.books.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.danger('Kunde inte hämta böcker från servern.');
        this.isLoading.set(false);
      }
    });
  }

  navigateToAddBook() {
    if (!this.authService.isAuthenticated()) {
      this.toast.info('Logga in för att lägga till en ny bok.');
      void this.router.navigate(['/login'], { queryParams: { returnUrl: '/books/new' } });
      return;
    }
    void this.router.navigateByUrl('/books/new');
  }

  isCreator(book: Book): boolean {
    const currentUser = this.authService.currentUser();
    return !!currentUser && currentUser.id === book.creatorId;
  }

  deleteBook(book: Book) {
    if (!confirm(`Är du säker på att du vill ta bort "${book.title}" från katalogen?`)) {
      return;
    }

    this.bookService.deleteBook(book.id).subscribe({
      next: () => {
        this.books.update(list => list.filter(b => b.id !== book.id));
        this.toast.success(`Boken "${book.title}" har raderats.`);
      },
      error: () => {
        this.toast.danger('Kunde inte radera boken. Kontrollera att du har behörighet.');
      }
    });
  }

  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=80';
  }
}

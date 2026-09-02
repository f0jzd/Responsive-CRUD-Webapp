import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookService } from './book.service';
import { ToastService } from '../../core/toast.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="container py-3">
      <div class="row justify-content-center">
        <div class="col-12 col-md-10 col-lg-8">
          <!-- Back button / Breadcrumb -->
          <div class="mb-3">
            <a routerLink="/books" class="text-decoration-none text-muted small d-inline-flex align-items-center">
              <i class="fa-solid fa-arrow-left me-1"></i> Tillbaka till bokkatalogen
            </a>
          </div>

          <!-- Main Card -->
          <div class="card shadow-sm border rounded-3" style="background-color: #161b22; border-color: #30363d !important;">
            <div class="card-header py-3 border-bottom" style="background-color: #21262d; border-color: #30363d !important;">
              <h1 class="h4 fw-bold mb-0 d-flex align-items-center text-white">
                <i
                  class="me-2 text-primary"
                  [class.fa-circle-plus]="!isEditMode()"
                  [class.fa-pen-to-square]="isEditMode()"
                  [class.fa-solid]="true"
                ></i>
                {{ isEditMode() ? 'Redigera bokdetaljer' : 'Lägg till ny bok i katalogen' }}
              </h1>
              <p class="text-secondary small mb-0 mt-1">
                {{ isEditMode() ? 'Uppdatera informationen om boken nedan.' : 'Fyll i bokens information för att dela den med andra användare.' }}
              </p>
            </div>

            <div class="card-body p-4">
              @if (isLoadingBook()) {
                <div class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Laddar bok...</span>
                  </div>
                  <p class="text-secondary small mt-2">Hämtar bokinformation...</p>
                </div>
              } @else {
                <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
                  <!-- Titel -->
                  <div class="mb-3">
                    <label for="title" class="form-label fw-semibold text-light">
                      Boktitel <span class="text-danger">*</span>
                    </label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="fa-solid fa-book"></i></span>
                      <input
                        id="title"
                        type="text"
                        class="form-control"
                        [class.is-invalid]="isFieldInvalid('title')"
                        formControlName="title"
                        placeholder="t.ex. Bröderna Lejonhjärta"
                      />
                    </div>
                    @if (isFieldInvalid('title')) {
                      <div class="text-danger small mt-1">
                        @if (form.get('title')?.errors?.['required']) {
                          Boktitel är obligatorisk.
                        } @else if (form.get('title')?.errors?.['maxlength']) {
                          Boktiteln får vara högst 200 tecken.
                        }
                      </div>
                    }
                  </div>

                  <!-- Författare -->
                  <div class="mb-3">
                    <label for="author" class="form-label fw-semibold text-light">
                      Författare <span class="text-danger">*</span>
                    </label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="fa-solid fa-feather-pointed"></i></span>
                      <input
                        id="author"
                        type="text"
                        class="form-control"
                        [class.is-invalid]="isFieldInvalid('author')"
                        formControlName="author"
                        placeholder="t.ex. Astrid Lindgren"
                      />
                    </div>
                    @if (isFieldInvalid('author')) {
                      <div class="text-danger small mt-1">
                        @if (form.get('author')?.errors?.['required']) {
                          Författare är obligatoriskt.
                        } @else if (form.get('author')?.errors?.['maxlength']) {
                          Författarnamnet får vara högst 150 tecken.
                        }
                      </div>
                    }
                  </div>

                  <!-- Publiceringsdatum -->
                  <div class="mb-3">
                    <label for="publicationDate" class="form-label fw-semibold text-light">
                      Publiceringsdatum <span class="text-danger">*</span>
                    </label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="fa-solid fa-calendar-days"></i></span>
                      <input
                        id="publicationDate"
                        type="date"
                        class="form-control"
                        [class.is-invalid]="isFieldInvalid('publicationDate')"
                        formControlName="publicationDate"
                      />
                    </div>
                    @if (isFieldInvalid('publicationDate')) {
                      <div class="text-danger small mt-1">
                        Publiceringsdatum är obligatoriskt.
                      </div>
                    }
                  </div>

                  <!-- Omslagsbilds-URL -->
                  <div class="mb-3">
                    <label for="coverImageUrl" class="form-label fw-semibold text-light">
                      Omslagsbild (URL) <span class="text-secondary fw-normal">(valfri)</span>
                    </label>
                    <div class="input-group">
                      <span class="input-group-text"><i class="fa-solid fa-image"></i></span>
                      <input
                        id="coverImageUrl"
                        type="url"
                        class="form-control"
                        [class.is-invalid]="isFieldInvalid('coverImageUrl')"
                        formControlName="coverImageUrl"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                    <div class="form-text text-secondary small">Ange en länk till en bild för bokomslaget.</div>

                    <!-- Live Image Preview -->
                    @if (form.get('coverImageUrl')?.value) {
                      <div class="mt-2 p-2 rounded border d-flex align-items-center gap-3" style="background-color: #0d1117; border-color: #30363d !important;">
                        <img
                          [src]="form.get('coverImageUrl')?.value"
                          alt="Förhandsgranskning"
                          class="rounded object-fit-cover shadow-sm"
                          style="width: 60px; height: 80px;"
                          (error)="previewError.set(true)"
                          (load)="previewError.set(false)"
                        />
                        <div>
                          <span class="small fw-semibold d-block text-light">Förhandsgranskning av omslag</span>
                          @if (previewError()) {
                            <span class="badge bg-warning text-dark small">Kunde inte ladda bilden från länken</span>
                          } @else {
                            <span class="badge bg-success small">Bilden laddades</span>
                          }
                        </div>
                      </div>
                    }
                  </div>

                  <!-- Beskrivning -->
                  <div class="mb-4">
                    <label for="description" class="form-label fw-semibold text-light">
                      Beskrivning / Sammanfattning <span class="text-secondary fw-normal">(valfri)</span>
                    </label>
                    <textarea
                      id="description"
                      rows="4"
                      class="form-control"
                      [class.is-invalid]="isFieldInvalid('description')"
                      formControlName="description"
                      placeholder="Skriv en kort sammanfattning eller recension av boken..."
                    ></textarea>
                    <div class="d-flex justify-content-between form-text text-secondary small">
                      <span>Kort text om bokens handling eller varför du rekommenderar den.</span>
                      <span>{{ form.get('description')?.value?.length || 0 }} / 2000</span>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="d-flex align-items-center justify-content-end gap-2 pt-3 border-top">
                    <a routerLink="/books" class="btn btn-outline-secondary">
                      <i class="fa-solid fa-xmark me-1"></i>Avbryt
                    </a>
                    <button
                      type="submit"
                      class="btn btn-primary px-4 shadow-sm"
                      [disabled]="form.invalid || isSubmitting()"
                    >
                      @if (isSubmitting()) {
                        <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        Sparar...
                      } @else {
                        <i class="fa-solid fa-floppy-disk me-1"></i>
                        {{ isEditMode() ? 'Uppdatera bok' : 'Spara ny bok' }}
                      }
                    </button>
                  </div>
                </form>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BookFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookService = inject(BookService);
  private authService = inject(AuthService);
  private toast = inject(ToastService);

  isEditMode = signal(false);
  isLoadingBook = signal(false);
  isSubmitting = signal(false);
  previewError = signal(false);
  bookId?: number;

  form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)]
    }),
    author: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)]
    }),
    publicationDate: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(2000)]
    }),
    coverImageUrl: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(1000)]
    })
  });

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.bookId = parseInt(idParam, 10);
      if (!isNaN(this.bookId)) {
        this.isEditMode.set(true);
        this.loadBook(this.bookId);
      }
    } else {
      // Default publicationDate to today for convenient input
      const today = new Date().toISOString().split('T')[0];
      this.form.patchValue({ publicationDate: today });
    }
  }

  loadBook(id: number) {
    this.isLoadingBook.set(true);
    this.bookService.getBook(id).subscribe({
      next: book => {
        const currentUser = this.authService.currentUser();
        if (currentUser && book.creatorId !== currentUser.id) {
          this.toast.danger('Du har inte behörighet att redigera denna bok.');
          void this.router.navigateByUrl('/books');
          return;
        }

        this.form.setValue({
          title: book.title,
          author: book.author,
          publicationDate: book.publicationDate,
          description: book.description ?? '',
          coverImageUrl: book.coverImageUrl ?? ''
        });
        this.isLoadingBook.set(false);
      },
      error: () => {
        this.toast.danger('Kunde inte hämta bokuppgifter.');
        void this.router.navigateByUrl('/books');
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formVal = this.form.getRawValue();
    const payload = {
      title: formVal.title.trim(),
      author: formVal.author.trim(),
      publicationDate: formVal.publicationDate,
      description: formVal.description.trim() || undefined,
      coverImageUrl: formVal.coverImageUrl.trim() || undefined
    };

    if (this.isEditMode() && this.bookId) {
      this.bookService.updateBook(this.bookId, payload).subscribe({
        next: () => {
          this.toast.success(`Boken "${payload.title}" uppdaterades framgångsrikt!`);
          void this.router.navigateByUrl('/books');
        },
        error: () => {
          this.toast.danger('Ett fel uppstod när boken skulle uppdateras.');
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.bookService.createBook(payload).subscribe({
        next: () => {
          this.toast.success(`Boken "${payload.title}" lades till i katalogen!`);
          void this.router.navigateByUrl('/books');
        },
        error: () => {
          this.toast.danger('Ett fel uppstod när boken skulle sparas.');
          this.isSubmitting.set(false);
        }
      });
    }
  }
}

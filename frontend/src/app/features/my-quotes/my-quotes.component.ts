import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Quote } from '../../core/models';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-my-quotes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container py-2">
      <!-- Header -->
      <div class="row align-items-center mb-4 g-3 bg-white p-4 rounded-3 shadow-sm border">
        <div class="col-md-8">
          <h1 class="h2 fw-bold text-dark mb-1">
            <i class="fa-solid fa-quote-left text-warning me-2"></i>Mina citat
          </h1>
          <p class="text-muted mb-0">
            Samla, inspireras av och hantera dina personliga favoritcitat.
          </p>
        </div>
        <div class="col-md-4 text-md-end">
          <span class="badge bg-primary fs-6 px-3 py-2">
            <i class="fa-solid fa-bookmark me-1"></i> {{ quotes().length }} sparade citat
          </span>
        </div>
      </div>

      <div class="row g-4">
        <!-- Quote Form (Add / Edit) -->
        <div class="col-lg-5">
          <div class="card shadow-sm border-0 sticky-top" style="top: 80px; z-index: 10;">
            <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
              <h2 class="h5 fw-bold mb-0 text-dark">
                <i
                  class="me-2 text-primary fa-solid"
                  [class.fa-plus-circle]="!editingId()"
                  [class.fa-pen-to-square]="editingId()"
                ></i>
                {{ editingId() ? 'Redigera citat' : 'Lägg till nytt citat' }}
              </h2>
              @if (editingId()) {
                <button class="btn btn-outline-secondary btn-sm" (click)="cancelEdit()">
                  <i class="fa-solid fa-xmark me-1"></i>Avbryt
                </button>
              }
            </div>

            <div class="card-body p-4">
              <form [formGroup]="form" (ngSubmit)="saveQuote()">
                <!-- Quote text -->
                <div class="mb-3">
                  <label for="quoteText" class="form-label fw-semibold">
                    Citattext <span class="text-danger">*</span>
                  </label>
                  <textarea
                    id="quoteText"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('text')"
                    formControlName="text"
                    rows="4"
                    placeholder="Skriv eller klistra in citatet här..."
                  ></textarea>
                  <div class="d-flex justify-content-between form-text small">
                    <span>Inspirerande ord, visdom eller tankar.</span>
                    <span>{{ form.get('text')?.value?.length || 0 }} / 1000</span>
                  </div>
                  @if (isFieldInvalid('text')) {
                    <div class="text-danger small mt-1">
                      @if (form.get('text')?.errors?.['required']) {
                        Citattext är obligatorisk.
                      } @else if (form.get('text')?.errors?.['maxlength']) {
                        Citatet får vara högst 1000 tecken.
                      }
                    </div>
                  }
                </div>

                <!-- Author -->
                <div class="mb-4">
                  <label for="quoteAuthor" class="form-label fw-semibold">
                    Författare / Källa <span class="text-muted fw-normal">(valfri)</span>
                  </label>
                  <div class="input-group">
                    <span class="input-group-text bg-light"><i class="fa-solid fa-feather"></i></span>
                    <input
                      id="quoteAuthor"
                      type="text"
                      class="form-control"
                      [class.is-invalid]="isFieldInvalid('author')"
                      formControlName="author"
                      placeholder="t.ex. Astrid Lindgren, Albert Einstein"
                    />
                  </div>
                  @if (isFieldInvalid('author')) {
                    <div class="text-danger small mt-1">
                      Författare får vara högst 200 tecken.
                    </div>
                  }
                </div>

                <!-- Submit Button -->
                <div class="d-grid gap-2">
                  <button
                    type="submit"
                    class="btn btn-primary shadow-sm"
                    [disabled]="form.invalid || isSubmitting()"
                  >
                    @if (isSubmitting()) {
                      <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Sparar...
                    } @else {
                      <i class="fa-solid fa-floppy-disk me-1"></i>
                      {{ editingId() ? 'Uppdatera citat' : 'Spara favoritcitat' }}
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Quotes List Column -->
        <div class="col-lg-7">
          @if (isLoading()) {
            <div class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Laddar citat...</span>
              </div>
              <p class="text-muted small mt-2">Hämtar dina favoritcitat...</p>
            </div>
          } @else if (quotes().length === 0) {
            <div class="card card-body text-center py-5 shadow-sm border-0 bg-white">
              <div class="text-muted mb-3">
                <i class="fa-solid fa-quote-left fs-1 text-secondary opacity-50"></i>
              </div>
              <h3 class="h5 text-secondary">Inga citat än</h3>
              <p class="text-muted small">
                Du har inte sparat några citat än. Skriv ditt första favoritcitat i formuläret till vänster!
              </p>
            </div>
          } @else {
            <div class="d-flex flex-column gap-3">
              @for (quote of quotes(); track quote.id) {
                <div
                  class="card border-0 shadow-sm rounded-3 quote-card position-relative"
                  [class.border-start]="true"
                  [class.border-4]="true"
                  [class.border-warning]="editingId() !== quote.id"
                  [class.border-primary]="editingId() === quote.id"
                  [class.bg-light]="editingId() === quote.id"
                >
                  <div class="card-body p-4">
                    <div class="d-flex align-items-start">
                      <i class="fa-solid fa-quote-left fs-4 text-warning opacity-50 me-3 mt-1 flex-shrink-0"></i>
                      <div class="flex-grow-1">
                        <blockquote class="blockquote mb-2 fs-6 fw-normal text-dark">
                          "{{ quote.text }}"
                        </blockquote>
                        <figcaption class="blockquote-footer mb-3 text-primary fw-semibold">
                          {{ quote.author || 'Okänd författare' }}
                        </figcaption>

                        <div class="d-flex align-items-center justify-content-between pt-2 border-top">
                          <span class="text-muted small">
                            <i class="fa-regular fa-clock me-1"></i>
                            {{ quote.createdAtUtc | date:'yyyy-MM-dd' }}
                          </span>
                          <div class="btn-group btn-group-sm">
                            <button
                              type="button"
                              class="btn btn-outline-secondary"
                              (click)="editQuote(quote)"
                              title="Redigera citat"
                            >
                              <i class="fa-solid fa-pen-to-square me-1"></i>Ändra
                            </button>
                            <button
                              type="button"
                              class="btn btn-outline-danger"
                              (click)="deleteQuote(quote)"
                              title="Ta bort citat"
                            >
                              <i class="fa-solid fa-trash-can me-1"></i>Ta bort
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .quote-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .quote-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.08) !important;
    }
  `]
})
export class MyQuotesComponent implements OnInit {
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  quotes = signal<Quote[]>([]);
  editingId = signal<number | undefined>(undefined);
  isLoading = signal(true);
  isSubmitting = signal(false);

  form = new FormGroup({
    text: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(1000)]
    }),
    author: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(200)]
    })
  });

  ngOnInit() {
    this.loadQuotes();
  }

  loadQuotes() {
    this.isLoading.set(true);
    this.http.get<Quote[]>(`${environment.apiUrl}/quotes`).subscribe({
      next: data => {
        this.quotes.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.danger('Kunde inte ladda dina citat.');
        this.isLoading.set(false);
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  editQuote(quote: Quote) {
    this.editingId.set(quote.id);
    this.form.setValue({
      text: quote.text,
      author: quote.author ?? ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.editingId.set(undefined);
    this.form.reset({ text: '', author: '' });
  }

  saveQuote() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const formVal = this.form.getRawValue();
    const payload = {
      text: formVal.text.trim(),
      author: formVal.author.trim() || undefined
    };

    const currentId = this.editingId();
    if (currentId) {
      this.http.put(`${environment.apiUrl}/quotes/${currentId}`, payload).subscribe({
        next: () => {
          this.toast.success('Citatet har uppdaterats!');
          this.cancelEdit();
          this.isSubmitting.set(false);
          this.loadQuotes();
        },
        error: () => {
          this.toast.danger('Kunde inte uppdatera citatet.');
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.http.post<Quote>(`${environment.apiUrl}/quotes`, payload).subscribe({
        next: () => {
          this.toast.success('Nytt citat lades till!');
          this.form.reset({ text: '', author: '' });
          this.isSubmitting.set(false);
          this.loadQuotes();
        },
        error: () => {
          this.toast.danger('Kunde inte spara citatet.');
          this.isSubmitting.set(false);
        }
      });
    }
  }

  deleteQuote(quote: Quote) {
    if (!confirm('Är du säker på att du vill ta bort detta citat?')) {
      return;
    }

    this.http.delete(`${environment.apiUrl}/quotes/${quote.id}`).subscribe({
      next: () => {
        this.quotes.update(list => list.filter(q => q.id !== quote.id));
        this.toast.success('Citatet togs bort.');
        if (this.editingId() === quote.id) {
          this.cancelEdit();
        }
      },
      error: () => {
        this.toast.danger('Kunde inte ta bort citatet.');
      }
    });
  }
}

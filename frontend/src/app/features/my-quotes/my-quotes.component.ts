import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

type Quote = { id: number; text: string; author?: string };

@Component({
  selector: 'app-my-quotes',
  imports: [ReactiveFormsModule],
  template: `
    <main class="container py-4"><div class="row justify-content-center"><div class="col-lg-8">
      <h1 class="mb-4"><i class="fa-solid fa-quote-left me-2"></i>Mina citat</h1>
      <form [formGroup]="form" (ngSubmit)="save()" class="card card-body mb-4 shadow-sm">
        <textarea class="form-control mb-2" formControlName="text" placeholder="Skriv ett citat"></textarea>
        <input class="form-control mb-2" formControlName="author" placeholder="Författare (valfri)">
        <button class="btn btn-primary align-self-start" [disabled]="form.invalid"><i class="fa-solid fa-save me-1"></i>{{ editingId ? 'Uppdatera citat' : 'Spara citat' }}</button>
      </form>
      @for (quote of quotes; track quote.id) { <article class="card card-body mb-2"><blockquote class="mb-1">{{ quote.text }}</blockquote><small class="text-muted">{{ quote.author || 'Okänd författare' }}</small><div class="mt-2"><button class="btn btn-outline-secondary btn-sm me-2" (click)="edit(quote)"><i class="fa-solid fa-pen"></i> Ändra</button><button class="btn btn-outline-danger btn-sm" (click)="remove(quote.id)"><i class="fa-solid fa-trash"></i> Ta bort</button></div></article> }
    </div></div></main>`
})
export class MyQuotesComponent {
  private http = inject(HttpClient);
  quotes: Quote[] = [];
  editingId?: number;
  form = new FormGroup({ text: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(1000)] }), author: new FormControl('', { nonNullable: true, validators: Validators.maxLength(200) }) });
  constructor() { this.load(); }
  load() { this.http.get<Quote[]>(`${environment.apiUrl}/quotes`).subscribe(data => this.quotes = data); }
  save() {
    const request = this.editingId
      ? this.http.put(`${environment.apiUrl}/quotes/${this.editingId}`, this.form.getRawValue())
      : this.http.post<Quote>(`${environment.apiUrl}/quotes`, this.form.getRawValue());
    request.subscribe(() => { this.form.reset({ text: '', author: '' }); this.editingId = undefined; this.load(); });
  }
  edit(quote: Quote) { this.editingId = quote.id; this.form.setValue({ text: quote.text, author: quote.author ?? '' }); }
  remove(id: number) { if (confirm('Ta bort citatet?')) this.http.delete(`${environment.apiUrl}/quotes/${id}`).subscribe(() => this.load()); }
}

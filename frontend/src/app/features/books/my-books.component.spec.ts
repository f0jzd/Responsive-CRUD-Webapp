import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyBooksComponent } from './my-books.component';
import { BookService } from './book.service';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { of } from 'rxjs';
import { Book } from '../../core/models';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { routes } from '../../app.routes';
import { authGuard } from '../../core/auth.guard';

describe('MyBooksComponent', () => {
  let component: MyBooksComponent;
  let fixture: ComponentFixture<MyBooksComponent>;

  const mockMyBooks: Book[] = [
    {
      id: 10,
      title: 'Domain-Driven Design',
      author: 'Eric Evans',
      publicationDate: '2003-08-30',
      description: 'Tackling Complexity in the Heart of Software',
      coverImageUrl: 'ddd.jpg',
      creatorId: 1,
      creatorEmail: 'me@example.com',
      createdAtUtc: new Date().toISOString()
    },
    {
      id: 11,
      title: 'Refactoring to Patterns',
      author: 'Joshua Kerievsky',
      publicationDate: '2004-08-15',
      description: 'Design patterns and refactorings',
      coverImageUrl: 'patterns.jpg',
      creatorId: 1,
      creatorEmail: 'me@example.com',
      createdAtUtc: new Date().toISOString()
    }
  ];

  const mockBookService = {
    getMyBooks: jest.fn().mockReturnValue(of(mockMyBooks)),
    deleteBook: jest.fn().mockReturnValue(of(undefined))
  };

  const currentUserSignal = signal<{ id: number; email: string } | null>({ id: 1, email: 'me@example.com' });
  const mockAuthService = {
    isAuthenticated: jest.fn().mockReturnValue(true),
    currentUser: currentUserSignal
  };

  const mockToast = {
    success: jest.fn(),
    danger: jest.fn(),
    info: jest.fn()
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockBookService.getMyBooks.mockReturnValue(of(mockMyBooks));
    currentUserSignal.set({ id: 1, email: 'me@example.com' });

    await TestBed.configureTestingModule({
      imports: [MyBooksComponent],
      providers: [
        provideRouter(routes),
        { provide: BookService, useValue: mockBookService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastService, useValue: mockToast }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyBooksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads and displays only current user books', () => {
    expect(mockBookService.getMyBooks).toHaveBeenCalled();
    expect(component.myBooks().length).toBe(2);

    const cards = fixture.debugElement.queryAll(By.css('.book-card'));
    expect(cards.length).toBe(2);

    const title1 = cards[0].query(By.css('.card-title')).nativeElement.textContent;
    expect(title1).toContain('Domain-Driven Design');

    // Cards must show 'Created by you' badge
    const badges = fixture.debugElement.queryAll(By.css('.badge.bg-success'));
    expect(badges.length).toBe(2);
    expect(badges[0].nativeElement.textContent).toContain('Created by you');
  });

  it('filters books by title, author, or description using search input', () => {
    component.searchTerm.set('Joshua');
    fixture.detectChanges();

    expect(component.filteredBooks().length).toBe(1);
    expect(component.filteredBooks()[0].title).toBe('Refactoring to Patterns');

    component.searchTerm.set('Complexity');
    fixture.detectChanges();

    expect(component.filteredBooks().length).toBe(1);
    expect(component.filteredBooks()[0].title).toBe('Domain-Driven Design');

    component.searchTerm.set('');
    fixture.detectChanges();

    expect(component.filteredBooks().length).toBe(2);
  });

  it('renders zero-contributions empty state with Call-to-Action to add first book when user has 0 books', () => {
    mockBookService.getMyBooks.mockReturnValue(of([]));
    component.loadMyBooks();
    fixture.detectChanges();

    expect(component.myBooks().length).toBe(0);

    const emptyState = fixture.debugElement.query(By.css('.card-body.text-center'));
    expect(emptyState).not.toBeNull();
    expect(emptyState.nativeElement.textContent).toContain('Du har inte lagt till några böcker än');

    const ctaButton = emptyState.query(By.css('a[routerLink="/books/new"]'));
    expect(ctaButton).not.toBeNull();
    expect(ctaButton.nativeElement.textContent).toContain('Lägg till din första bok');
  });

  it('renders search empty state when search term has no matches', () => {
    component.searchTerm.set('NonExistentTermXYZ');
    fixture.detectChanges();

    expect(component.filteredBooks().length).toBe(0);

    const emptySearch = fixture.debugElement.query(By.css('.card-body.text-center'));
    expect(emptySearch.nativeElement.textContent).toContain('Inga böcker matchade din sökning "NonExistentTermXYZ"');

    const clearBtn = emptySearch.query(By.css('button'));
    expect(clearBtn).not.toBeNull();
    clearBtn.nativeElement.click();
    fixture.detectChanges();

    expect(component.searchTerm()).toBe('');
    expect(component.filteredBooks().length).toBe(2);
  });

  it('renders inline edit link targeting /books/:id/edit', () => {
    const editLinks = fixture.debugElement.queryAll(By.css('a[title="Redigera bok"]'));
    expect(editLinks.length).toBe(2);
    expect(editLinks[0].attributes['href']).toBe('/books/10/edit');
    expect(editLinks[1].attributes['href']).toBe('/books/11/edit');
  });

  it('handles delete confirmation flow: opens modal, can cancel, or confirm and delete', () => {
    expect(component.bookToDelete()).toBeNull();

    // Click delete on first book
    const deleteButtons = fixture.debugElement.queryAll(By.css('button[title="Radera bok"]'));
    deleteButtons[0].nativeElement.click();
    fixture.detectChanges();

    expect(component.bookToDelete()).toEqual(mockMyBooks[0]);
    const modal = fixture.debugElement.query(By.css('.modal-content.border-danger'));
    expect(modal).not.toBeNull();
    expect(modal.nativeElement.textContent).toContain('Domain-Driven Design');

    // Cancel delete
    const cancelBtn = modal.query(By.css('.modal-footer .btn-outline-secondary')).nativeElement;
    cancelBtn.click();
    fixture.detectChanges();

    expect(component.bookToDelete()).toBeNull();
    expect(mockBookService.deleteBook).not.toHaveBeenCalled();

    // Open again and confirm
    deleteButtons[0].nativeElement.click();
    fixture.detectChanges();

    const confirmBtn = fixture.debugElement.query(By.css('.modal-footer .btn-danger')).nativeElement;
    confirmBtn.click();
    fixture.detectChanges();

    expect(mockBookService.deleteBook).toHaveBeenCalledWith(10);
    expect(mockToast.success).toHaveBeenCalledWith(expect.stringContaining('Domain-Driven Design'));
    expect(component.myBooks().length).toBe(1);
    expect(component.myBooks()[0].id).toBe(11);
  });

  it('clicking card opens Quick View modal', () => {
    expect(fixture.debugElement.query(By.css('app-book-quick-view'))).toBeNull();

    const firstCard = fixture.debugElement.query(By.css('.book-card')).nativeElement;
    firstCard.click();
    fixture.detectChanges();

    const quickView = fixture.debugElement.query(By.css('app-book-quick-view'));
    expect(quickView).not.toBeNull();
    expect(component.selectedBook()).toEqual(mockMyBooks[0]);
  });
});

describe('Route /my-books Guard', () => {
  it('route /my-books is configured with authGuard', () => {
    const myBooksRoute = routes.find(r => r.path === 'my-books');
    expect(myBooksRoute).toBeDefined();
    expect(myBooksRoute?.canActivate).toContain(authGuard);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookListComponent } from './book-list.component';
import { BookService } from './book.service';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { of } from 'rxjs';
import { Book } from '../../core/models';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

describe('BookListComponent', () => {
  let component: BookListComponent;
  let fixture: ComponentFixture<BookListComponent>;
  
  const mockBooks: Book[] = [
    {
      id: 1,
      title: 'My Created Book',
      author: 'Test Author',
      publicationDate: '2023-01-01',
      description: 'Owned by user 1',
      coverImageUrl: 'test1.jpg',
      creatorId: 1,
      creatorEmail: 'me@example.com',
      createdAtUtc: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Other Book',
      author: 'Another Author',
      publicationDate: '2023-02-01',
      description: 'Owned by user 2',
      coverImageUrl: 'test2.jpg',
      creatorId: 2,
      creatorEmail: 'other@example.com',
      createdAtUtc: new Date().toISOString()
    }
  ];

  const mockBookService = {
    getBooks: jest.fn().mockReturnValue(of(mockBooks)),
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
    currentUserSignal.set({ id: 1, email: 'me@example.com' });

    await TestBed.configureTestingModule({
      imports: [BookListComponent],
      providers: [
        provideRouter([]),
        { provide: BookService, useValue: mockBookService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastService, useValue: mockToast }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Quick View', () => {
    it('clicking a book card opens the quick view modal', () => {
      expect(fixture.debugElement.query(By.css('app-book-quick-view'))).toBeNull();
      
      const card = fixture.debugElement.query(By.css('.book-card')).nativeElement;
      card.click();
      fixture.detectChanges();

      const modal = fixture.debugElement.query(By.css('app-book-quick-view'));
      expect(modal).not.toBeNull();
      expect(component.selectedBook()).toEqual(mockBooks[0]);
    });

    it('closing the modal removes it from the view', () => {
      component.selectedBook.set(mockBooks[0]);
      fixture.detectChanges();
      
      expect(fixture.debugElement.query(By.css('app-book-quick-view'))).not.toBeNull();

      const modalDebug = fixture.debugElement.query(By.css('app-book-quick-view'));
      modalDebug.triggerEventHandler('close', null);
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('app-book-quick-view'))).toBeNull();
      expect(component.selectedBook()).toBeNull();
    });
  });

  describe('Creator Badges and Action Controls', () => {
    it('shows "Created by you" badge only on owned books', () => {
      const cards = fixture.debugElement.queryAll(By.css('.book-card'));
      expect(cards.length).toBe(2);

      // First book is owned by user 1
      const firstCardBadge = cards[0].query(By.css('.badge.bg-success'));
      expect(firstCardBadge).not.toBeNull();
      expect(firstCardBadge.nativeElement.textContent).toContain('Created by you');

      // Second book is owned by user 2
      const secondCardBadge = cards[1].query(By.css('.badge.bg-success'));
      expect(secondCardBadge).toBeNull();
    });

    it('shows Edit and Delete buttons only on owned books', () => {
      const cards = fixture.debugElement.queryAll(By.css('.book-card'));

      // First book (owned): buttons visible
      const firstCardEditBtn = cards[0].query(By.css('a[title="Redigera bok"]'));
      const firstCardDeleteBtn = cards[0].query(By.css('button[title="Radera bok"]'));
      expect(firstCardEditBtn).not.toBeNull();
      expect(firstCardDeleteBtn).not.toBeNull();

      // Second book (not owned): buttons NOT rendered
      const secondCardEditBtn = cards[1].query(By.css('a[title="Redigera bok"]'));
      const secondCardDeleteBtn = cards[1].query(By.css('button[title="Radera bok"]'));
      expect(secondCardEditBtn).toBeNull();
      expect(secondCardDeleteBtn).toBeNull();
    });
  });

  describe('Deletion Confirmation Modal', () => {
    it('clicking delete button opens confirmation modal without calling delete API', () => {
      expect(component.bookToDelete()).toBeNull();
      expect(fixture.debugElement.query(By.css('.modal.border-danger, .modal-content.border-danger'))).toBeNull();

      const deleteBtn = fixture.debugElement.query(By.css('button[title="Radera bok"]')).nativeElement;
      deleteBtn.click();
      fixture.detectChanges();

      expect(component.bookToDelete()).toEqual(mockBooks[0]);
      expect(mockBookService.deleteBook).not.toHaveBeenCalled();

      // Check modal rendered
      const modalContent = fixture.debugElement.query(By.css('.modal-content.border-danger'));
      expect(modalContent).not.toBeNull();
      expect(modalContent.nativeElement.textContent).toContain('Bekräfta borttagning');
      expect(modalContent.nativeElement.textContent).toContain('My Created Book');
    });

    it('canceling delete closes confirmation modal without calling delete API', () => {
      component.requestDeleteBook(mockBooks[0]);
      fixture.detectChanges();

      expect(component.bookToDelete()).not.toBeNull();

      const cancelBtn = fixture.debugElement.query(By.css('.modal-footer .btn-outline-secondary')).nativeElement;
      cancelBtn.click();
      fixture.detectChanges();

      expect(component.bookToDelete()).toBeNull();
      expect(mockBookService.deleteBook).not.toHaveBeenCalled();
    });

    it('confirming delete calls deleteBook API, displays toast and updates book list', () => {
      component.requestDeleteBook(mockBooks[0]);
      fixture.detectChanges();

      const confirmBtn = fixture.debugElement.query(By.css('.modal-footer .btn-danger')).nativeElement;
      confirmBtn.click();
      fixture.detectChanges();

      expect(mockBookService.deleteBook).toHaveBeenCalledWith(1);
      expect(mockToast.success).toHaveBeenCalledWith(expect.stringContaining('My Created Book'));
      expect(component.books().some(b => b.id === 1)).toBe(false);
      expect(component.bookToDelete()).toBeNull();
    });
  });
});

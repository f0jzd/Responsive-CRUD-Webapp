import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BookListComponent } from './book-list.component';
import { BookService } from './book.service';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { of } from 'rxjs';
import { Book } from '../../core/models';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

describe('BookListComponent Quick View', () => {
  let component: BookListComponent;
  let fixture: ComponentFixture<BookListComponent>;
  
  const mockBooks: Book[] = [{
    id: 1,
    title: 'Test Title',
    author: 'Test Author',
    publicationDate: '2023-01-01',
    description: 'Test Description',
    coverImageUrl: 'test.jpg',
    creatorId: 1,
    createdAtUtc: new Date().toISOString()
  }];

  const mockBookService = {
    getBooks: jest.fn().mockReturnValue(of(mockBooks)),
    deleteBook: jest.fn()
  };

  const mockAuthService = {
    isAuthenticated: jest.fn().mockReturnValue(false),
    currentUser: jest.fn().mockReturnValue(null)
  };

  const mockToast = {
    success: jest.fn(),
    danger: jest.fn(),
    info: jest.fn()
  };

  beforeEach(async () => {
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

  it('clicking a book card opens the quick view modal', () => {
    // Assert no modal initially
    expect(fixture.debugElement.query(By.css('app-book-quick-view'))).toBeNull();
    
    // Click the card
    const card = fixture.debugElement.query(By.css('.book-card')).nativeElement;
    card.click();
    fixture.detectChanges();

    // Assert modal is open
    const modal = fixture.debugElement.query(By.css('app-book-quick-view'));
    expect(modal).not.toBeNull();
    expect(component.selectedBook()).toEqual(mockBooks[0]);
  });

  it('closing the modal removes it from the view', () => {
    // Open modal
    component.selectedBook.set(mockBooks[0]);
    fixture.detectChanges();
    
    expect(fixture.debugElement.query(By.css('app-book-quick-view'))).not.toBeNull();

    // Trigger close
    const modalDebug = fixture.debugElement.query(By.css('app-book-quick-view'));
    modalDebug.triggerEventHandler('close', null);
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('app-book-quick-view'))).toBeNull();
    expect(component.selectedBook()).toBeNull();
  });
});

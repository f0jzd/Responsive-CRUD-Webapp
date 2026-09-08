import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookQuickViewComponent } from './book-quick-view.component';
import { Book } from '../../core/models';
import { By } from '@angular/platform-browser';
import { AuthService } from '../../core/auth.service';
import { signal } from '@angular/core';

describe('BookQuickViewComponent', () => {
  let component: BookQuickViewComponent;
  let fixture: ComponentFixture<BookQuickViewComponent>;

  const currentUserSignal = signal<{ id: number; email: string } | null>(null);
  const mockAuthService = {
    currentUser: currentUserSignal
  };

  const mockBook: Book = {
    id: 1,
    title: 'Test Title',
    author: 'Test Author',
    publicationDate: '2023-01-01',
    description: 'Line 1\nLine 2',
    coverImageUrl: 'test-image.jpg',
    creatorId: 1,
    createdAtUtc: new Date('2023-01-01T12:00:00Z').toISOString()
  };

  beforeEach(async () => {
    currentUserSignal.set(null);

    await TestBed.configureTestingModule({
      imports: [BookQuickViewComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookQuickViewComponent);
    component = fixture.componentInstance;
    component.book = mockBook;
    fixture.detectChanges();
  });

  it('displays the book title, author, description, and cover', () => {
    const titleEl = fixture.debugElement.query(By.css('.modal-title')).nativeElement;
    expect(titleEl.textContent).toContain('Test Title');

    const bodyEl = fixture.debugElement.query(By.css('.modal-body')).nativeElement;
    expect(bodyEl.textContent).toContain('Test Author');
    expect(bodyEl.textContent).toContain('Line 1\nLine 2');
    
    const imgEl = fixture.debugElement.query(By.css('img')).nativeElement;
    expect(imgEl.src).toContain('test-image.jpg');
  });

  it('shows "Created by you" badge when the logged-in user is the book creator', () => {
    currentUserSignal.set({ id: 1, email: 'creator@example.com' });
    fixture.detectChanges();

    const badge = fixture.debugElement.query(By.css('.badge.bg-success'));
    expect(badge).not.toBeNull();
    expect(badge.nativeElement.textContent).toContain('Created by you');
  });

  it('does not show "Created by you" badge when logged out or when user is not the creator', () => {
    // Logged out
    currentUserSignal.set(null);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.badge.bg-success'))).toBeNull();

    // Logged in as different user
    currentUserSignal.set({ id: 99, email: 'other@example.com' });
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.badge.bg-success'))).toBeNull();
  });

  it('emits close event when close button is clicked', () => {
    jest.spyOn(component.close, 'emit');
    const closeBtn = fixture.debugElement.query(By.css('.btn-close')).nativeElement;
    closeBtn.click();
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('emits close event when backdrop is clicked', () => {
    jest.spyOn(component.close, 'emit');
    const modalDiv = fixture.debugElement.query(By.css('.modal')).nativeElement;
    modalDiv.click();
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('does not emit close when clicking inside the modal content', () => {
    jest.spyOn(component.close, 'emit');
    const modalContent = fixture.debugElement.query(By.css('.modal-content')).nativeElement;
    modalContent.click();
    expect(component.close.emit).not.toHaveBeenCalled();
  });

  it('emits close event on escape key press', () => {
    jest.spyOn(component.close, 'emit');
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(component.close.emit).toHaveBeenCalled();
  });
});

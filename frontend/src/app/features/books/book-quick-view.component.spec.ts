import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookQuickViewComponent } from './book-quick-view.component';
import { Book } from '../../core/models';
import { By } from '@angular/platform-browser';

describe('BookQuickViewComponent', () => {
  let component: BookQuickViewComponent;
  let fixture: ComponentFixture<BookQuickViewComponent>;

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
    await TestBed.configureTestingModule({
      imports: [BookQuickViewComponent]
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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookFormComponent } from './book-form.component';
import { BookService } from './book.service';
import { AuthService } from '../../core/auth.service';
import { ToastService } from '../../core/toast.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

describe('BookFormComponent', () => {
  let component: BookFormComponent;
  let fixture: ComponentFixture<BookFormComponent>;
  let router: Router;

  const mockBookService = {
    getBook: jest.fn(),
    createBook: jest.fn().mockReturnValue(of({ id: 99, title: 'New Book' })),
    updateBook: jest.fn().mockReturnValue(of(undefined))
  };

  const mockAuthService = {
    isAuthenticated: jest.fn().mockReturnValue(true),
    currentUser: jest.fn().mockReturnValue({ id: 1, email: 'demo@example.com' })
  };

  const mockToast = {
    success: jest.fn(),
    danger: jest.fn(),
    info: jest.fn()
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [BookFormComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => null
              }
            }
          }
        },
        { provide: BookService, useValue: mockBookService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastService, useValue: mockToast }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigateByUrl').mockImplementation(() => Promise.resolve(true));

    fixture = TestBed.createComponent(BookFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('initializes in create mode with empty fields and default publication date', () => {
    expect(component.isEditMode()).toBe(false);
    expect(component.form.get('title')?.value).toBe('');
    expect(component.form.get('author')?.value).toBe('');
    expect(component.form.get('publicationDate')?.value).toBeTruthy();
    expect(component.form.valid).toBe(false);
  });

  it('validates title requirement and max length of 200', () => {
    const titleControl = component.form.get('title');
    expect(titleControl?.valid).toBe(false);
    expect(titleControl?.hasError('required')).toBe(true);

    titleControl?.setValue('A'.repeat(200));
    expect(titleControl?.valid).toBe(true);

    titleControl?.setValue('A'.repeat(201));
    expect(titleControl?.valid).toBe(false);
    expect(titleControl?.hasError('maxlength')).toBe(true);
  });

  it('validates author requirement and max length of 100', () => {
    const authorControl = component.form.get('author');
    expect(authorControl?.valid).toBe(false);
    expect(authorControl?.hasError('required')).toBe(true);

    authorControl?.setValue('B'.repeat(100));
    expect(authorControl?.valid).toBe(true);

    authorControl?.setValue('B'.repeat(101));
    expect(authorControl?.valid).toBe(false);
    expect(authorControl?.hasError('maxlength')).toBe(true);
  });

  it('validates description max length of 2000', () => {
    const descControl = component.form.get('description');
    expect(descControl?.valid).toBe(true);

    descControl?.setValue('C'.repeat(2000));
    expect(descControl?.valid).toBe(true);

    descControl?.setValue('C'.repeat(2001));
    expect(descControl?.valid).toBe(false);
    expect(descControl?.hasError('maxlength')).toBe(true);
  });

  it('displays updated character counters as values change', () => {
    component.form.patchValue({
      title: 'Short Title',
      author: 'Some Author',
      description: 'A great book description'
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('11 / 200'); // 'Short Title'.length == 11
    expect(compiled.textContent).toContain('11 / 100'); // 'Some Author'.length == 11
    expect(compiled.textContent).toContain('24 / 2000'); // 'A great book description'.length == 24
  });

  it('displays live image preview when coverImageUrl is set', () => {
    component.form.patchValue({
      coverImageUrl: 'https://example.com/cover.jpg'
    });
    fixture.detectChanges();

    const img = fixture.debugElement.query(By.css('img[alt="Förhandsgranskning"]'));
    expect(img).not.toBeNull();
    expect(img.nativeElement.src).toBe('https://example.com/cover.jpg');

    const previewLabel = fixture.nativeElement.textContent;
    expect(previewLabel).toContain('Förhandsgranskning av omslag');
  });

  it('submits valid form, invokes createBook, shows toast, and navigates', () => {
    component.form.patchValue({
      title: 'Clean Architecture',
      author: 'Robert C. Martin',
      publicationDate: '2017-09-20',
      description: 'A Craftsman Guide to Software Structure',
      coverImageUrl: 'https://example.com/clean.jpg'
    });
    fixture.detectChanges();

    expect(component.form.valid).toBe(true);

    const submitBtn = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
    expect(submitBtn.disabled).toBe(false);

    component.onSubmit();

    expect(mockBookService.createBook).toHaveBeenCalledWith({
      title: 'Clean Architecture',
      author: 'Robert C. Martin',
      publicationDate: '2017-09-20',
      description: 'A Craftsman Guide to Software Structure',
      coverImageUrl: 'https://example.com/clean.jpg'
    });
    expect(mockToast.success).toHaveBeenCalledWith(expect.stringContaining('Clean Architecture'));
    expect(router.navigateByUrl).toHaveBeenCalledWith('/books');
  });

  it('disables submit button when required fields are missing', () => {
    component.form.patchValue({
      title: '',
      author: ''
    });
    fixture.detectChanges();

    const submitBtn = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
    expect(submitBtn.disabled).toBe(true);
  });
});

import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1100;">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          class="toast show align-items-center text-white border-0 mb-2 shadow"
          [class.bg-success]="toast.type === 'success'"
          [class.bg-danger]="toast.type === 'danger'"
          [class.bg-info]="toast.type === 'info'"
          [class.bg-warning]="toast.type === 'warning'"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <div class="d-flex">
            <div class="toast-body d-flex align-items-center">
              @if (toast.type === 'success') {
                <i class="fa-solid fa-circle-check me-2 fs-5"></i>
              } @else if (toast.type === 'danger') {
                <i class="fa-solid fa-circle-xmark me-2 fs-5"></i>
              } @else if (toast.type === 'warning') {
                <i class="fa-solid fa-triangle-exclamation me-2 fs-5"></i>
              } @else {
                <i class="fa-solid fa-circle-info me-2 fs-5"></i>
              }
              <span>{{ toast.message }}</span>
            </div>
            <button
              type="button"
              class="btn-close btn-close-white me-2 m-auto"
              (click)="toastService.dismiss(toast.id)"
              aria-label="Close"
            ></button>
          </div>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  toastService = inject(ToastService);
}

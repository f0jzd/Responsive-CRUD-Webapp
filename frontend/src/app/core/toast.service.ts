import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'danger' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private counter = 0;
  toasts = signal<ToastMessage[]>([]);

  show(message: string, type: 'success' | 'danger' | 'info' | 'warning' = 'success', durationMs = 4000) {
    const id = ++this.counter;
    this.toasts.update(list => [...list, { id, message, type }]);

    setTimeout(() => {
      this.dismiss(id);
    }, durationMs);
  }

  success(message: string) {
    this.show(message, 'success');
  }

  danger(message: string) {
    this.show(message, 'danger', 5000);
  }

  info(message: string) {
    this.show(message, 'info');
  }

  warning(message: string) {
    this.show(message, 'warning');
  }

  dismiss(id: number) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}

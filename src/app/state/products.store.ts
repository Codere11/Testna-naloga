import { Injectable, signal } from '@angular/core';
import { Product } from '../models/product.model';
import { ProductService } from '../core/services/product.service';

/**
 * Minimal signal-based store for products with loading and error state.
 * Local write model is kept in-memory (could be persisted to localStorage later).
 */
@Injectable({ providedIn: 'root' })
export class ProductsStore {
  readonly products = signal<Product[]>([]);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);

  // Local write-model; key = product.id
  private localEdits = new Map<number, Partial<Product>>();

  constructor(private api: ProductService) {}

  loadAll() {
    this.loading.set(true);
    this.error.set(null);
    this.api.getProducts().subscribe({
      next: (list) => {
        // Merge remote with local edits if any
        const merged = list.map((p) => ({ ...p, ...(this.localEdits.get(p.id) || {}) }));
        this.products.set(merged);
        this.loading.set(false);
      },
      error: (err) => {
this.error.set('Napaka pri nalaganju izdelkov. Poskusite znova.');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  updateLocal(productId: number, patch: Partial<Product>) {
    const current = this.localEdits.get(productId) || {};
    this.localEdits.set(productId, { ...current, ...patch });
    this.products.update((arr) => arr.map((p) => (p.id === productId ? { ...p, ...patch } : p)));
  }
}
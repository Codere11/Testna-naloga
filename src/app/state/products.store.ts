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
  private localAdds: Product[] = [];
  private localDeleted = new Set<number>();

  constructor(private api: ProductService) {}

  loadAll() {
    this.loading.set(true);
    this.error.set(null);
    this.api.getProducts().subscribe({
      next: (list) => {
        // Merge remote with local edits, apply local deletions, then prepend local adds
        const edited = list
          .filter((p) => !this.localDeleted.has(p.id))
          .map((p) => ({ ...p, ...(this.localEdits.get(p.id) || {}) }));
        const merged = [...this.localAdds, ...edited];
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

  /** Update an existing product locally (immutable UI update). */
  updateLocal(productId: number, patch: Partial<Product>) {
    const current = this.localEdits.get(productId) || {};
    this.localEdits.set(productId, { ...current, ...patch });
    this.products.update((arr) => arr.map((p) => (p.id === productId ? { ...p, ...patch } : p)));
  }

  /** Create a new product locally with a client-generated negative ID. */
  addLocal(product: Omit<Product, 'id'>) {
    const newId = this.generateLocalId();
    const created: Product = { id: newId, ...product } as Product;
    this.localAdds = [created, ...this.localAdds];
    this.products.update((arr) => [created, ...arr]);
  }

  /** Soft-delete locally. */
  deleteLocal(id: number) {
    if (id < 0) {
      this.localAdds = this.localAdds.filter((p) => p.id !== id);
      this.products.update((arr) => arr.filter((p) => p.id !== id));
    } else {
      this.localDeleted.add(id);
      this.products.update((arr) => arr.filter((p) => p.id !== id));
    }
  }

  private generateLocalId(): number {
    return -Date.now();
  }
}

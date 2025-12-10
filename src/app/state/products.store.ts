import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Product } from '../models/product.model';
import { ProductService } from '../core/services/product.service';
import { LocalStorageRepo } from '../core/services/local-storage.repo';

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

  private readonly LS_ADDS = 'products_local_adds';
  private readonly LS_EDITS = 'products_local_edits';
  private readonly LS_DELETED = 'products_local_deleted';

  constructor(private api: ProductService, private ls: LocalStorageRepo) {
    // hydrate local state
    this.localAdds = this.ls.get<Product[]>(this.LS_ADDS, []);
    const editsObj = this.ls.get<Record<string, Partial<Product>>>(this.LS_EDITS, {});
    this.localEdits = new Map<number, Partial<Product>>(
      Object.entries(editsObj).map(([k, v]) => [Number(k), v])
    );
    this.localDeleted = new Set<number>(this.ls.get<number[]>(this.LS_DELETED, []));
  }

  async loadAllOnce(): Promise<void> {
    if (this.products().length) return; // already loaded
    await this.loadAll();
  }

  async loadAll(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const list = await firstValueFrom(this.api.getProducts());
      const edited = list
        .filter((p) => !this.localDeleted.has(p.id))
        .map((p) => ({ ...p, ...(this.localEdits.get(p.id) || {}) }));
      const merged = [...this.localAdds, ...edited];
      this.products.set(merged);
    } catch (err) {
      this.error.set('Napaka pri nalaganju izdelkov. Poskusite znova.');
      console.error(err);
    } finally {
      this.loading.set(false);
    }
  }

  /** Update an existing product locally (immutable UI update). */
  updateLocal(productId: number, patch: Partial<Product>) {
    const current = this.localEdits.get(productId) || {};
    this.localEdits.set(productId, { ...current, ...patch });
    this.persist();
    this.products.update((arr) => arr.map((p) => (p.id === productId ? { ...p, ...patch } : p)));
  }

  /** Create a new product locally with a client-generated negative ID. */
  addLocal(product: Omit<Product, 'id'>) {
    const newId = this.generateLocalId();
    const created: Product = { id: newId, ...product } as Product;
    this.localAdds = [created, ...this.localAdds];
    this.persist();
    this.products.update((arr) => [created, ...arr]);
  }

  /** Soft-delete locally. */
  deleteLocal(id: number) {
    if (id < 0) {
      this.localAdds = this.localAdds.filter((p) => p.id !== id);
    } else {
      this.localDeleted.add(id);
    }
    this.persist();
    this.products.update((arr) => arr.filter((p) => p.id !== id));
  }

  private persist() {
    const editsObj: Record<string, Partial<Product>> = {};
    this.localEdits.forEach((v, k) => (editsObj[String(k)] = v));
    this.ls.set(this.LS_ADDS, this.localAdds);
    this.ls.set(this.LS_EDITS, editsObj);
    this.ls.set(this.LS_DELETED, Array.from(this.localDeleted));
  }

  private generateLocalId(): number {
    return -Date.now();
  }
}

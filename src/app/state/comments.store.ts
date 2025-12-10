import { Injectable, signal } from '@angular/core';
import { Comment } from '../models/comment.model';
import { LocalStorageRepo } from '../core/services/local-storage.repo';

/** Local-only comments store keyed by productId, persisted v localStorage. */
@Injectable({ providedIn: 'root' })
export class CommentsStore {
  private data = new Map<number, Comment[]>();
  private readonly LS_COMMENTS = 'comments_by_product';

  readonly error = signal<string | null>(null);

  constructor(private ls: LocalStorageRepo) {
    const obj = this.ls.get<Record<string, Comment[]>>(this.LS_COMMENTS, {});
    Object.entries(obj).forEach(([k, v]) => this.data.set(Number(k), v));
  }

  private persist() {
    const obj: Record<string, Comment[]> = {};
    this.data.forEach((v, k) => (obj[String(k)] = v));
    this.ls.set(this.LS_COMMENTS, obj);
  }

  list(productId: number): Comment[] {
    return this.data.get(productId) ?? [];
  }

  add(productId: number, value: Omit<Comment, 'id' | 'productId' | 'created_at' | 'updated_at'>) {
    const id = -Date.now();
    const now = new Date().toISOString();
    const c: Comment = { id, productId, created_at: now, updated_at: now, ...value } as Comment;
    const arr = this.data.get(productId) ?? [];
    this.data.set(productId, [c, ...arr]);
    this.persist();
  }

  update(productId: number, id: number, patch: Partial<Comment>) {
    const arr = this.data.get(productId) ?? [];
    this.data.set(
      productId,
      arr.map((c) => (c.id === id ? { ...c, ...patch, updated_at: new Date().toISOString() } : c))
    );
    this.persist();
  }

  delete(productId: number, id: number) {
    const arr = this.data.get(productId) ?? [];
    this.data.set(productId, arr.filter((c) => c.id !== id));
    this.persist();
  }
}

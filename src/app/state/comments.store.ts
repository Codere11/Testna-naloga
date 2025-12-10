import { Injectable, signal } from '@angular/core';
import { Comment } from '../models/comment.model';

/** Local-only comments store keyed by productId. */
@Injectable({ providedIn: 'root' })
export class CommentsStore {
  private data = new Map<number, Comment[]>();

  // derived signals for last operation status
  readonly error = signal<string | null>(null);

  list(productId: number): Comment[] {
    return this.data.get(productId) ?? [];
  }

  add(productId: number, value: Omit<Comment, 'id' | 'productId' | 'created_at' | 'updated_at'>) {
    const id = -Date.now();
    const now = new Date().toISOString();
    const c: Comment = { id, productId, created_at: now, updated_at: now, ...value } as Comment;
    const arr = this.data.get(productId) ?? [];
    this.data.set(productId, [c, ...arr]);
  }

  update(productId: number, id: number, patch: Partial<Comment>) {
    const arr = this.data.get(productId) ?? [];
    this.data.set(
      productId,
      arr.map((c) => (c.id === id ? { ...c, ...patch, updated_at: new Date().toISOString() } : c))
    );
  }

  delete(productId: number, id: number) {
    const arr = this.data.get(productId) ?? [];
    this.data.set(productId, arr.filter((c) => c.id !== id));
  }
}
import { Component, OnInit, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CurrencyPipe } from '@angular/common';
import { ProductsStore } from '../../state/products.store';
import { CommentsStore } from '../../state/comments.store';
import { Product } from '../../models/product.model';
import { Comment } from '../../models/comment.model';
import { CommentDialogComponent } from '../comments/comment-dialog.component';

@Component({
  selector: 'app-product-details',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDialogModule,
    MatSnackBarModule,
    CurrencyPipe,
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss',
})
export class ProductDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  product?: Product;
  comments: Comment[] = [];

  constructor(private products: ProductsStore, private commentsStore: CommentsStore) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const p = this.products.products().find((x) => x.id === id);
    if (!p) {
      // If not loaded (deep link), load and then find
      this.products.loadAll();
      setTimeout(() => {
        this.product = this.products.products().find((x) => x.id === id);
        this.loadComments();
      }, 300);
    } else {
      this.product = p;
      this.loadComments();
    }
  }

  loadComments() {
    if (!this.product) return;
    this.comments = this.commentsStore.list(this.product.id);
  }

  addComment() {
    if (!this.product) return;
    this.dialog
      .open(CommentDialogComponent, { width: '560px', maxWidth: '90vw', data: { mode: 'create' } })
      .afterClosed()
      .subscribe((res) => {
        if (!res) return;
        if (res.error) this.snack.open(res.error, 'Zapri', { duration: 4000 });
        else if (res.value) {
          this.commentsStore.add(this.product!.id, res.value);
          this.loadComments();
          this.snack.open('Komentar dodan (lokalno).', undefined, { duration: 2500 });
        }
      });
  }

  editComment(c: Comment) {
    this.dialog
      .open(CommentDialogComponent, {
        width: '560px',
        maxWidth: '90vw',
        data: { mode: 'edit', value: { author: c.author, content: c.content } },
      })
      .afterClosed()
      .subscribe((res) => {
        if (!res) return;
        if (res.error) this.snack.open(res.error, 'Zapri', { duration: 4000 });
        else if (res.value && this.product) {
          this.commentsStore.update(this.product.id, c.id, res.value);
          this.loadComments();
          this.snack.open('Komentar posodobljen (lokalno).', undefined, { duration: 2500 });
        }
      });
  }

  deleteComment(c: Comment) {
    if (!this.product) return;
    this.commentsStore.delete(this.product.id, c.id);
    this.loadComments();
    this.snack.open('Komentar izbrisan (lokalno).', undefined, { duration: 2500 });
  }

  back() {
    this.router.navigate(['/']);
  }
}
import { Component, OnInit, computed, signal, effect } from '@angular/core';
import { NgIf, NgFor, DecimalPipe, CurrencyPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductsStore } from '../../state/products.store';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    DecimalPipe,
    CurrencyPipe,
  ],
  templateUrl: './products-list.component.html',
  styleUrl: './products-list.component.scss',
})
export class ProductsListComponent implements OnInit {
  // Pagination state
  pageIndex = signal(0);
  pageSize = signal(10);

  // Search filter
  query = signal('');

  // Derived filtered and paginated view
  readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    const list = this.store.products();
    if (!q) return list;
    return list.filter(
      (p) => p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  });

  readonly total = computed(() => this.filtered().length);

  readonly page = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  displayedColumns = ['image', 'title', 'category', 'price', 'rating'];

  constructor(public store: ProductsStore, private snack: MatSnackBar) {
    // Show snackbar on load error
    effect(() => {
      const err = this.store.error();
      if (err) this.snack.open(err, 'Dismiss', { duration: 4000 });
    });
  }

  ngOnInit(): void {
    this.store.loadAll();
  }

  onPage(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }
}
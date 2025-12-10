import { Component, OnInit, computed, signal, effect } from '@angular/core';
import { NgIf, NgFor, DecimalPipe, CurrencyPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductsStore } from '../../state/products.store';
import { Product } from '../../models/product.model';
import { ProductDialogComponent } from './product-dialog.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

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
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
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

displayedColumns = ['image', 'title', 'category', 'price', 'rating', 'actions'];

constructor(public store: ProductsStore, private snack: MatSnackBar, private dialog: MatDialog) {
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

  openEditDialog(p: Product) {
    this.dialog
      .open(ProductDialogComponent, {
        width: '520px',
        data: { mode: 'edit', product: p },
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result) return;
        if (result.error) {
          this.snack.open(result.error, 'Zapri', { duration: 4000 });
        } else if (result.patch) {
          this.store.updateLocal(p.id, result.patch);
          this.snack.open('Izdelek je posodobljen (lokalno).', undefined, { duration: 2500 });
        }
      });
  }

  openCreateDialog() {
    this.dialog
      .open(ProductDialogComponent, {
        width: '520px',
        data: { mode: 'create' },
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result) return;
        if (result.error) {
          this.snack.open(result.error, 'Zapri', { duration: 4000 });
        } else if (result.value) {
          this.store.addLocal(result.value);
          this.snack.open('Izdelek je dodan (lokalno).', undefined, { duration: 2500 });
        }
      });
  }

  confirmDelete(id: number) {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '420px',
        data: {
          title: 'Izbrišem izdelek?',
          message: 'Brisanje je samo lokalno in povratno ni možno.',
          confirmLabel: 'Izbriši',
          cancelLabel: 'Prekliči',
        },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (ok) {
          this.store.deleteLocal(id);
          this.snack.open('Izdelek je izbrisan (lokalno).', undefined, { duration: 2500 });
        }
      });
  }
}

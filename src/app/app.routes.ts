import { Routes } from '@angular/router';
import { ProductsListComponent } from './features/products/products-list.component';

export const routes: Routes = [
  { path: '', component: ProductsListComponent },
  { path: '**', redirectTo: '' },
];

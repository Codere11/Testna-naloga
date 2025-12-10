import { Routes } from '@angular/router';
import { ProductsListComponent } from './features/products/products-list.component';
import { ProductDetailsComponent } from './features/products/product-details.component';

export const routes: Routes = [
  { path: '', component: ProductsListComponent },
  { path: 'products/:id', component: ProductDetailsComponent },
  { path: '**', redirectTo: '' },
];

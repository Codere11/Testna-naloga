import { Routes } from '@angular/router';
import { ProductsListComponent } from './features/products/products-list.component';

export const routes: Routes = [
  { path: '', component: ProductsListComponent },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./features/products/product-details.component').then((m) => m.ProductDetailsComponent),
    resolve: {
      products: () => import('./resolvers/products.resolver').then((m) => m.productsResolver),
    },
  },
  { path: '**', redirectTo: '' },
];

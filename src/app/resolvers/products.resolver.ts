import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { ProductsStore } from '../state/products.store';

export const productsResolver: ResolveFn<Promise<void>> = () => {
  const store = inject(ProductsStore);
  return store.loadAllOnce();
};
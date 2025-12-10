import { MatPaginatorIntl } from '@angular/material/paginator';
import { Provider } from '@angular/core';

class SlPaginatorIntl extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Elementov na stran:';
  override nextPageLabel = 'Naslednja stran';
  override previousPageLabel = 'Prejšnja stran';
  override firstPageLabel = 'Prva stran';
  override lastPageLabel = 'Zadnja stran';

  override getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return '0 od ' + length;
    }
    const startIndex = page * pageSize;
    const endIndex = Math.min(startIndex + pageSize, Math.max(length, 0));
    return `${startIndex + 1}–${endIndex} od ${length}`;
  };
}

export const MAT_PAGINATOR_INTL_PROVIDER: Provider = {
  provide: MatPaginatorIntl,
  useClass: SlPaginatorIntl,
};
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';
import { Product } from '../../models/product.model';

/**
 * Dialog for creating or editing a product. All writes are local-only.
 * Code and comments in English as requested.
 */
@Component({
  selector: 'app-product-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, NgIf],
  templateUrl: './product-dialog.component.html',
  styleUrl: './product-dialog.component.scss',
})
export class ProductDialogComponent {
  readonly isEdit: boolean;

  // Initialized in constructor
  form!: FormGroup<{
    title: any;
    price: any;
    category: any;
    description: any;
    image: any;
  }>;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { mode: 'create' } | { mode: 'edit'; product: Product },
    private fb: FormBuilder,
    private ref: MatDialogRef<ProductDialogComponent>
  ) {
    this.isEdit = data.mode === 'edit';

    // Build form now that FormBuilder is available
    this.form = this.fb.nonNullable.group({
      title: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(3)]),
      price: this.fb.nonNullable.control(0, [Validators.required, Validators.min(0)]),
      category: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
      description: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(5)]),
      image: this.fb.nonNullable.control('', [Validators.required]),
    });

    // Patch defaults when editing
    if (this.isEdit && 'product' in data) {
      this.form.patchValue({
        title: data.product.title,
        price: data.product.price,
        category: data.product.category,
        description: data.product.description,
        image: data.product.image,
      });
    }
  }

  submit() {
    if (this.form.invalid) {
      // Return an error to caller; list component shows snackbar
      this.ref.close({ error: 'Prosimo, izpolnite vsa obvezna polja pravilno.' });
      return;
    }

    const value = this.form.getRawValue();

    if (this.isEdit) {
      // Return a patch for updateLocal
      this.ref.close({ patch: value });
    } else {
      // Return full value for addLocal (id is generated in the store)
      this.ref.close({ value });
    }
  }

  cancel() {
    this.ref.close();
  }
}
import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-comment-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, NgIf],
  templateUrl: './comment-dialog.component.html',
  styleUrl: './comment-dialog.component.scss',
})
export class CommentDialogComponent {
  readonly isEdit: boolean;

  form!: FormGroup<{ author: FormControl<string>; content: FormControl<string> }>;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data:
      | { mode: 'create' }
      | { mode: 'edit'; value: { author: string; content: string } },
    private fb: FormBuilder,
    private ref: MatDialogRef<CommentDialogComponent>
  ) {
    this.isEdit = data.mode === 'edit';

    this.form = this.fb.nonNullable.group({
      author: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
      content: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(3)]),
    } as const);

    if (this.isEdit && 'value' in data) {
      this.form.patchValue(data.value);
    }
  }

  submit() {
    if (this.form.invalid) {
      this.ref.close({ error: 'Prosimo, izpolnite ime in komentar.' });
      return;
    }
    const value = this.form.getRawValue();
    this.ref.close({ value });
  }

  cancel() {
    this.ref.close();
  }
}
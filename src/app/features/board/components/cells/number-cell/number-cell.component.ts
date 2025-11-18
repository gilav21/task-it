import { Component, input, output, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ICellComponent } from '../../../models/cell.interface';

@Component({
  selector: 'app-number-cell',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="number-cell" 
         (click)="enableEdit()"
         [class.editing]="isEditing">
      @if (isEditing) {
        <input #inputField
               type="number"
               [ngModel]="value()" 
               (ngModelChange)="onValueChange($event)"
               (blur)="disableEdit()"
               (keydown.enter)="disableEdit()"
               class="cell-input" />
      } @else {
        <span class="cell-value">{{ value() }}</span>
      }
    </div>
  `,
  styles: [`
    .number-cell {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center; /* Numbers usually centered */
      padding: 0 8px;
      cursor: text;
      
      &:hover {
        background-color: #f5f6f8;
      }
    }
    .cell-input {
      width: 100%;
      height: 100%;
      border: none;
      outline: none;
      background: transparent;
      font-family: inherit;
      font-size: inherit;
      text-align: center;
    }
    .cell-value {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `]
})
export class NumberCellComponent implements ICellComponent<number> {
  value = input<number>(0);
  config = input<any>({});
  valueChange = output<number>();

  inputField = viewChild<ElementRef>('inputField');
  isEditing = false;

  focus(): void {
    this.enableEdit();
  }

  enableEdit() {
    this.isEditing = true;
    setTimeout(() => this.inputField()?.nativeElement.focus(), 0);
  }

  disableEdit() {
    this.isEditing = false;
  }

  onValueChange(val: number) {
    this.valueChange.emit(val);
  }
}

import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellComponent } from '../../../models/cell.interface';

@Component({
    selector: 'app-checkbox-cell',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="checkbox-cell" (click)="toggle()">
      <div class="checkbox-box" [class.checked]="value()">
        @if (value()) {
          ✓
        }
      </div>
    </div>
  `,
    styles: [`
    .checkbox-cell {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      
      &:hover {
        background-color: #f5f6f8;
      }
    }
    .checkbox-box {
      width: 18px;
      height: 18px;
      border: 2px solid #ccc;
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: white;
      transition: all 0.2s;

      &.checked {
        background-color: #00c875;
        border-color: #00c875;
      }
    }
  `]
})
export class CheckboxCellComponent implements ICellComponent<boolean> {
    value = input<boolean>(false);
    config = input<any>({});
    valueChange = output<boolean>();

    focus(): void {
        // Focus logic if needed (e.g. keyboard nav)
    }

    toggle() {
        this.valueChange.emit(!this.value());
    }
}

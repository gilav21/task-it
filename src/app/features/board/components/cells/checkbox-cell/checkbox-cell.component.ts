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

  static getLightweightView(value: any, config: any): HTMLElement {
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent = 'center';
    container.style.padding = '0 8px';
    container.style.boxSizing = 'border-box';

    const box = document.createElement('div');
    box.style.width = '16px';
    box.style.height = '16px';
    box.style.border = '2px solid #ddd';
    box.style.borderRadius = '4px';

    if (value) {
      box.style.backgroundColor = '#007aff';
      box.style.borderColor = '#007aff';
      // Optional checkmark
      box.innerHTML = '<svg viewBox="0 0 24 24" style="fill: white; width: 12px; height: 12px; display: block; margin: 0 auto;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
    }
    container.appendChild(box);

    return container;
  }
}

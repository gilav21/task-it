import { Component, input, output, signal, viewChild, ElementRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule, ConnectionPositionPair } from '@angular/cdk/overlay';
import { ICellComponent } from '../../../models/cell.interface';

@Component({
  selector: 'app-date-cell',
  standalone: true,
  imports: [CommonModule, OverlayModule],
  template: `
    <div class="date-cell" (click)="openPicker()">
      <div class="date-pill" [class.has-value]="!!value()">
        {{ displayValue() }}
      </div>

      <!-- Native Date/Time Inputs -->
      @if (mode() === 'date' || mode() === 'datetime') {
        <input [type]="inputType()" 
               #dateInput
               [value]="value()" 
               (change)="onDateChange($event)"
               (blur)="onBlur()"
               class="hidden-input">
      }

      <!-- Quarter Picker Overlay -->
      @if (mode() === 'quarter') {
        <ng-template cdkConnectedOverlay
                     [cdkConnectedOverlayOrigin]="trigger"
                     [cdkConnectedOverlayOpen]="isOpen()"
                     [cdkConnectedOverlayPositions]="positions"
                     (overlayOutsideClick)="isOpen.set(false)">
          <div class="quarter-picker">
            @for (q of quarters; track q) {
              <div class="quarter-option" (click)="selectQuarter(q)">
                {{ q }}
              </div>
            }
          </div>
        </ng-template>
        <!-- Trigger for overlay -->
        <div cdkOverlayOrigin #trigger="cdkOverlayOrigin" class="overlay-trigger"></div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      position: relative;
    }
    .date-cell {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      
      &:hover .date-pill {
        background-color: #e6e9ef;
      }
    }
    .date-pill {
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 13px;
      color: #999;
      transition: background 0.2s;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;

      &.has-value {
        color: #333;
        background-color: #dff0ff;
        &:hover { background-color: #cce5ff; }
      }
    }
    .hidden-input {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      opacity: 0;
      cursor: pointer;
      z-index: 10;
    }
    .overlay-trigger {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none;
      visibility: visible;
      opacity: 0;
    }
    .quarter-picker {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      padding: 8px;
      width: 120px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .quarter-option {
      padding: 8px 12px;
      border-radius: 4px;
      text-align: center;
      cursor: pointer;
      font-weight: 500;
      &:hover { background-color: #f5f6f8; }
    }
  `]
})
export class DateCellComponent implements ICellComponent<string> {
  value = input<string>('');
  config = input<any>({});
  valueChange = output<string>();

  dateInput = viewChild<ElementRef<HTMLInputElement>>('dateInput');
  isOpen = signal(false);

  quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

  positions: ConnectionPositionPair[] = [
    { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top' },
    { originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom' }
  ];

  mode = computed(() => this.config()?.mode || 'date'); // 'date' | 'datetime' | 'quarter'

  inputType = computed(() => this.mode() === 'datetime' ? 'datetime-local' : 'date');

  displayValue = computed(() => {
    const val = this.value();
    if (!val) return 'Set Date';

    if (this.mode() === 'datetime') {
      return new Date(val).toLocaleString([], {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    }
    return val; // Date and Quarter are already friendly strings
  });

  focus(): void {
    this.openPicker();
  }

  openPicker() {
    if (this.mode() === 'quarter') {
      this.isOpen.set(true);
    } else {
      try {
        this.dateInput()?.nativeElement.showPicker();
      } catch (e) {
        this.dateInput()?.nativeElement.click();
      }
    }
  }

  onDateChange(event: any) {
    this.valueChange.emit(event.target.value);
  }

  selectQuarter(q: string) {
    this.valueChange.emit(q);
    this.isOpen.set(false);
  }

  onBlur() {
    // Optional cleanup
  }

  static getLightweightView(value: any, config: any): HTMLElement {
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '6px';
    container.style.padding = '0 8px';
    container.style.boxSizing = 'border-box';
    container.style.color = '#666';
    container.style.fontSize = '13px';

    if (value) {
      const icon = document.createElement('span');
      icon.textContent = '📅';
      icon.style.fontSize = '14px';

      const text = document.createElement('span');
      // Simple date formatting if it's a date string/object
      try {
        const date = new Date(value);
        text.textContent = isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
      } catch (e) {
        text.textContent = String(value);
      }

      container.appendChild(icon);
      container.appendChild(text);
    }

    return container;
  }
}

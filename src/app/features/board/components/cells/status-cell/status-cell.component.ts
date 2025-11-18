import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule, ConnectionPositionPair } from '@angular/cdk/overlay';
import { ICellComponent } from '../../../models/cell.interface';

@Component({
  selector: 'app-status-cell',
  standalone: true,
  imports: [CommonModule, OverlayModule],
  template: `
    <div class="status-cell" 
         [style.background-color]="currentColor()"
         (click)="togglePicker()">
      <span class="status-text">{{ currentText() }}</span>
      
      <!-- Fold/Corner effect (optional visual polish) -->
      <div class="fold"></div>
    </div>

    <ng-template cdkConnectedOverlay
                 [cdkConnectedOverlayOrigin]="trigger"
                 [cdkConnectedOverlayOpen]="isOpen()"
                 [cdkConnectedOverlayPositions]="positions"
                 (overlayOutsideClick)="isOpen.set(false)">
      <div class="status-picker">
        @for (opt of options(); track opt.id) {
          <div class="picker-option" 
               [style.background-color]="opt.color"
               (click)="select(opt.id)">
            {{ opt.text }}
          </div>
        }
      </div>
    </ng-template>

    <!-- Invisible trigger for the overlay -->
    <div cdkOverlayOrigin #trigger="cdkOverlayOrigin" class="overlay-trigger"></div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      position: relative; /* Ensure absolute children are relative to host */
    }
    .status-cell {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      cursor: pointer;
      font-weight: 500;
      position: relative;
      transition: filter 0.2s;

      &:hover {
        filter: brightness(0.9);
      }
    }
    .status-text {
      z-index: 1;
      text-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
    .overlay-trigger {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none;
      visibility: visible; /* Must be visible for CDK to calculate position */
      opacity: 0;
    }

    /* Picker Dropdown */
    .status-picker {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      padding: 8px;
      width: 160px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      animation: fadeIn 0.1s ease-out;
    }
    .picker-option {
      padding: 8px 12px;
      border-radius: 4px;
      color: white;
      text-align: center;
      cursor: pointer;
      font-weight: 500;
      transition: transform 0.1s;

      &:hover {
        transform: scale(1.02);
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class StatusCellComponent implements ICellComponent<string> {
  value = input<string>('');
  config = input<any>({});
  valueChange = output<string>();

  isOpen = signal(false);

  // Overlay positions
  positions: ConnectionPositionPair[] = [
    {
      originX: 'center', originY: 'center',
      overlayX: 'center', overlayY: 'center'
    },
    {
      originX: 'start', originY: 'bottom',
      overlayX: 'start', overlayY: 'top'
    }
  ];

  // Computed helpers
  labels = computed(() => this.config()?.labels || {});

  currentColor = computed(() => {
    const val = this.value();
    const label = this.labels()[val];
    return label ? label.color : '#c4c4c4'; // Default gray
  });

  currentText = computed(() => {
    const val = this.value();
    const label = this.labels()[val];
    return label ? label.text : (val || ''); // Fallback to value or empty
  });

  options = computed(() => {
    const lbs = this.labels();
    return Object.keys(lbs).map(key => ({
      id: key,
      ...lbs[key]
    }));
  });

  togglePicker() {
    this.isOpen.update(v => !v);
  }

  select(id: string) {
    this.valueChange.emit(id);
    this.isOpen.set(false);
  }

  focus() {
    this.togglePicker();
  }
}

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
        <div class="picker-input-container" (click)="$event.stopPropagation()">
            <input type="text" 
                   [value]="newOptionText()" 
                   (input)="newOptionText.set($any($event.target).value)"
                   (keydown)="onInputKeydown($event)"
                   placeholder="New Status..." 
                   class="picker-input">
            <button class="picker-add-btn" (click)="addOption($event)">+</button>
        </div>
        <div class="picker-options-list">
            @for (opt of options(); track opt.id) {
            <div class="picker-option" 
                [style.background-color]="opt.color"
                (click)="select(opt.id)">
                {{ opt.text }}
            </div>
            }
        </div>
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
      width: 180px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      animation: fadeIn 0.1s ease-out;
    }
    .picker-input-container {
        display: flex;
        gap: 4px;
    }
    .picker-input {
        flex: 1;
        padding: 4px 8px;
        border: 1px solid #eee;
        border-radius: 4px;
        font-size: 12px;
        outline: none;
        &:focus { border-color: #007aff; }
    }
    .picker-add-btn {
        padding: 0 8px;
        background: #f0f0f0;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        &:hover { background: #e0e0e0; }
    }
    .picker-options-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
        max-height: 200px;
        overflow-y: auto;
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
  configChange = output<any>();

  isOpen = signal(false);
  newOptionText = signal('');

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
    if (!this.isOpen()) {
      this.newOptionText.set(''); // Reset input on close
    }
  }

  select(id: string) {
    this.valueChange.emit(id);
    this.isOpen.set(false);
  }

  addOption(event: Event) {
    event.stopPropagation(); // Prevent closing
    const text = this.newOptionText().trim();
    if (!text) return;

    // Generate ID and Color
    const id = text.toLowerCase().replace(/\s+/g, '_');
    const color = this.getRandomColor();

    // Create new config
    const newLabels = {
      ...this.labels(),
      [id]: { text, color }
    };

    const newConfig = {
      ...this.config(),
      labels: newLabels
    };

    // Emit config change
    this.configChange.emit(newConfig);

    // Select the new option immediately
    this.valueChange.emit(id);

    this.isOpen.set(false);
    this.newOptionText.set('');
  }

  onInputKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.addOption(event);
    }
  }

  private getRandomColor(): string {
    const palette = [
      '#ff5f56', // Red
      '#ffbd2e', // Yellow
      '#27c93f', // Green
      '#007aff', // Blue
      '#5856d6', // Purple
      '#ff2d55', // Pink
      '#5ac8fa', // Light Blue
      '#ffcc00', // Gold
      '#8e8e93', // Gray
      '#ff9500', // Orange
      '#af52de', // Violet
      '#34c759', // Light Green
      '#00c7be', // Teal
      '#32ade6', // Sky Blue
      '#a2845e'  // Brown
    ];

    // Get currently used colors
    const usedColors = new Set<string>();
    const lbs = this.labels();
    Object.values(lbs).forEach((l: any) => usedColors.add(l.color));

    // Find unused colors
    const availableColors = palette.filter(c => !usedColors.has(c));

    // If we have unused colors, pick one randomly
    if (availableColors.length > 0) {
      return availableColors[Math.floor(Math.random() * availableColors.length)];
    }

    // Fallback: pick any random color from palette if all are used
    return palette[Math.floor(Math.random() * palette.length)];
  }

  focus() {
    this.togglePicker();
  }
}

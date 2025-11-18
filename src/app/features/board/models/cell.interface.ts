import { InputSignal, OutputEmitterRef } from '@angular/core';

export interface ICellComponent<T = any> {
  // Angular Signal Inputs
  value: InputSignal<T>; 
  config: InputSignal<any>; // Column specific settings (e.g. labels map)
  
  // Event to notify the grid of changes
  valueChange: OutputEmitterRef<T>;
  
  // Useful for keyboard navigation (Enter to edit)
  focus(): void;
}

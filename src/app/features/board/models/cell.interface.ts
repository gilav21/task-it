import { InputSignal, OutputEmitterRef, Type } from '@angular/core';

export type LightweightRenderer = (value: any, config: any) => HTMLElement;

export interface ICellComponent<T = any> {
  // Angular Signal Inputs
  value: InputSignal<T>;
  config: InputSignal<any>; // Column specific settings (e.g. labels map)

  // Event to notify the grid of changes
  valueChange: OutputEmitterRef<T>;

  // Useful for keyboard navigation (Enter to edit)
  focus(): void;
}

export interface CellComponentType<T = any> extends Type<ICellComponent<T>> {
  getLightweightView?: LightweightRenderer;
}

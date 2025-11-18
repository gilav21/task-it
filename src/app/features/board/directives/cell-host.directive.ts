import { Directive, ViewContainerRef, inject, effect, input, output, ComponentRef } from '@angular/core';
import { CellRegistryService } from '../services/cell-registry.service';
import { ICellComponent } from '../models/cell.interface';

@Directive({
    selector: '[appCellHost]',
    standalone: true
})
export class CellHostDirective {
    // Inputs passed from the grid HTML
    cellType = input.required<string>();
    cellValue = input.required<any>();
    cellConfig = input<any>({});

    // Output bubbling up to the grid
    cellValueChange = output<any>();

    private vcr = inject(ViewContainerRef);
    private factory = inject(CellRegistryService);
    private componentRef?: ComponentRef<ICellComponent>;

    constructor() {
        // Reactively re-render if the generic Type changes
        effect(() => {
            this.loadComponent(this.cellType());
        });

        // Reactively update inputs on the created component instance
        effect(() => {
            if (this.componentRef) {
                this.componentRef.setInput('value', this.cellValue());
                this.componentRef.setInput('config', this.cellConfig());
            }
        });
    }

    private loadComponent(type: string) {
        this.vcr.clear();

        const componentClass = this.factory.getComponent(type);
        this.componentRef = this.vcr.createComponent(componentClass);

        // Subscribe to the component's output manually
        this.componentRef.instance.valueChange.subscribe((val: any) => {
            this.cellValueChange.emit(val);
        });
    }
}

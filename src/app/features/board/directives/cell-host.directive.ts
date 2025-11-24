import { Directive, ViewContainerRef, Input, Output, EventEmitter, OnChanges, SimpleChanges, ComponentRef, Type, inject } from '@angular/core';
import { CellType } from '../models/board.model';
import { ICellComponent } from '../models/cell.interface';
import { CellRegistryService } from '../services/cell-registry.service';

@Directive({
    selector: '[appCellHost]',
    standalone: true
})
export class CellHostDirective implements OnChanges {
    @Input({ required: true }) cellType!: CellType;
    @Input() cellValue: any;
    @Input() cellConfig: any;
    @Input() isScrolling = false;

    @Output() cellValueChange = new EventEmitter<any>();
    @Output() cellConfigChange = new EventEmitter<any>();

    private componentRef?: ComponentRef<ICellComponent>;
    private registry = inject(CellRegistryService);
    private vcr = inject(ViewContainerRef);
    private placeholderNode: HTMLElement | null = null;

    ngOnChanges(changes: SimpleChanges) {
        if (changes['isScrolling']) {
            this.render();
            return;
        }

        if (changes['cellType']) {
            this.render();
        } else if (this.componentRef) {
            // Update inputs if component exists and type hasn't changed
            if (changes['cellValue']) {
                this.componentRef.setInput('value', this.cellValue);
            }
            if (changes['cellConfig']) {
                this.componentRef.setInput('config', this.cellConfig);
            }
        }
    }

    private render() {
        // Cleanup previous state
        this.vcr.clear();
        if (this.componentRef) {
            this.componentRef.destroy();
            this.componentRef = undefined;
        }
        if (this.placeholderNode) {
            this.placeholderNode.remove();
            this.placeholderNode = null;
        }

        // Lightweight Rendering Mode
        if (this.isScrolling) {
            this.renderLightweight();
            return;
        }

        // Full Component Mode
        const componentClass = this.registry.getComponent(this.cellType);
        if (componentClass) {
            this.componentRef = this.vcr.createComponent(componentClass);
            this.componentRef.setInput('value', this.cellValue);
            this.componentRef.setInput('config', this.cellConfig);

            // Subscribe to output
            if (this.componentRef.instance.valueChange) {
                this.componentRef.instance.valueChange.subscribe(val => {
                    this.cellValueChange.emit(val);
                });
            }

            // Subscribe to config change (if supported)
            if ((this.componentRef.instance as any).configChange) {
                (this.componentRef.instance as any).configChange.subscribe((conf: any) => {
                    this.cellConfigChange.emit(conf);
                });
            }
        }
    }

    private renderLightweight() {
        // Optimization: Use direct DOM manipulation for maximum speed during scroll.
        const parent = this.vcr.element.nativeElement.parentElement;
        if (!parent) return;

        const componentClass = this.registry.getComponent(this.cellType);

        if (componentClass && (componentClass as any).getLightweightView) {
            const element = (componentClass as any).getLightweightView(this.cellValue, this.cellConfig);
            this.placeholderNode = element;
            parent.appendChild(element);
        } else {
            // Fallback if no lightweight view defined
            const container = document.createElement('div');
            container.style.padding = '0 8px';
            container.style.display = 'flex';
            container.style.alignItems = 'center';
            container.style.height = '100%';
            container.textContent = String(this.cellValue || '');

            this.placeholderNode = container;
            parent.appendChild(container);
        }
    }
}

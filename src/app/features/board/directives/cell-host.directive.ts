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

        const container = document.createElement('div');
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        container.style.padding = '0 8px';
        container.style.boxSizing = 'border-box';
        container.style.overflow = 'hidden';

        switch (this.cellType) {
            case 'STATUS': {
                const labels = this.cellConfig?.labels || {};
                const val = this.cellValue;
                const label = labels[val];
                const color = label ? label.color : '#c4c4c4';
                const text = label ? label.text : (val || '');

                const pill = document.createElement('div');
                pill.textContent = text;
                pill.style.backgroundColor = color;
                pill.style.color = 'white';
                pill.style.borderRadius = '4px';
                pill.style.padding = '4px 12px';
                pill.style.fontSize = '13px';
                pill.style.textAlign = 'center';
                pill.style.width = '100%';
                pill.style.whiteSpace = 'nowrap';
                pill.style.overflow = 'hidden';
                pill.style.textOverflow = 'ellipsis';
                pill.style.textShadow = '0 1px 2px rgba(0,0,0,0.1)';

                container.appendChild(pill);
                break;
            }

            case 'PEOPLE': {
                const people = Array.isArray(this.cellValue) ? this.cellValue : [];
                container.style.paddingLeft = '8px';

                people.slice(0, 3).forEach((p: any, i: number) => {
                    const circle = document.createElement('div');
                    circle.style.width = '24px';
                    circle.style.height = '24px';
                    circle.style.borderRadius = '50%';
                    circle.style.backgroundColor = '#e0e0e0';
                    circle.style.border = '2px solid white';
                    circle.style.marginLeft = i === 0 ? '0' : '-8px';
                    circle.style.flexShrink = '0';
                    container.appendChild(circle);
                });
                break;
            }

            case 'TAGS': {
                const tags = Array.isArray(this.cellValue) ? this.cellValue : [];
                container.style.gap = '4px';

                tags.slice(0, 2).forEach((tag: any) => {
                    const pill = document.createElement('div');
                    // Handle both string tags and object tags if applicable, assuming string for now based on previous code
                    const text = typeof tag === 'string' ? tag : (tag.title || tag.name || '');
                    pill.textContent = text;
                    pill.style.backgroundColor = '#f0f0f0';
                    pill.style.color = '#666';
                    pill.style.padding = '2px 8px';
                    pill.style.borderRadius = '12px';
                    pill.style.fontSize = '11px';
                    pill.style.whiteSpace = 'nowrap';
                    container.appendChild(pill);
                });
                break;
            }

            case 'CHECKBOX': {
                container.style.justifyContent = 'center';
                const box = document.createElement('div');
                box.style.width = '16px';
                box.style.height = '16px';
                box.style.border = '2px solid #ddd';
                box.style.borderRadius = '4px';

                if (this.cellValue) {
                    box.style.backgroundColor = '#007aff';
                    box.style.borderColor = '#007aff';
                    // Optional checkmark
                    box.innerHTML = '<svg viewBox="0 0 24 24" style="fill: white; width: 12px; height: 12px; display: block; margin: 0 auto;"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
                }
                container.appendChild(box);
                break;
            }

            case 'DATE': {
                container.style.gap = '6px';
                container.style.color = '#666';
                container.style.fontSize = '13px';

                if (this.cellValue) {
                    const icon = document.createElement('span');
                    icon.textContent = '📅';
                    icon.style.fontSize = '14px';

                    const text = document.createElement('span');
                    // Simple date formatting if it's a date string/object
                    try {
                        const date = new Date(this.cellValue);
                        text.textContent = isNaN(date.getTime()) ? String(this.cellValue) : date.toLocaleDateString();
                    } catch (e) {
                        text.textContent = String(this.cellValue);
                    }

                    container.appendChild(icon);
                    container.appendChild(text);
                }
                break;
            }

            default: {
                // TEXT, NUMBER, or fallback
                if (this.cellValue) {
                    // Shimmer effect for non-empty values
                    const shimmer1 = document.createElement('div');
                    shimmer1.style.width = '70%';
                    shimmer1.style.height = '8px';
                    shimmer1.style.backgroundColor = '#f0f0f0';
                    shimmer1.style.borderRadius = '4px';
                    shimmer1.style.marginBottom = '4px';

                    const shimmer2 = document.createElement('div');
                    shimmer2.style.width = '40%';
                    shimmer2.style.height = '8px';
                    shimmer2.style.backgroundColor = '#f0f0f0';
                    shimmer2.style.borderRadius = '4px';

                    const wrapper = document.createElement('div');
                    wrapper.style.width = '100%';
                    wrapper.style.display = 'flex';
                    wrapper.style.flexDirection = 'column';
                    wrapper.style.justifyContent = 'center';

                    wrapper.appendChild(shimmer1);
                    wrapper.appendChild(shimmer2);
                    container.appendChild(wrapper);
                }
                break;
            }
        }

        this.placeholderNode = container;
        parent.appendChild(container);
    }
}

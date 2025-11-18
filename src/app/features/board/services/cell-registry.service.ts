import { Injectable, Type } from '@angular/core';
import { ICellComponent } from '../models/cell.interface';
import { TextCellComponent } from '../components/cells/text-cell/text-cell.component';
import { NumberCellComponent } from '../components/cells/number-cell/number-cell.component';
import { CheckboxCellComponent } from '../components/cells/checkbox-cell/checkbox-cell.component';
import { StatusCellComponent } from '../components/cells/status-cell/status-cell.component';
import { DateCellComponent } from '../components/cells/date-cell/date-cell.component';

@Injectable({ providedIn: 'root' })
export class CellRegistryService {
    private registry = new Map<string, Type<ICellComponent>>();

    constructor() {
        this.register('TEXT', TextCellComponent);
        this.register('NUMBER', NumberCellComponent);
        this.register('CHECKBOX', CheckboxCellComponent);
        this.register('STATUS', StatusCellComponent);
        this.register('DATE', DateCellComponent);
    }

    register(type: string, component: Type<ICellComponent>) {
        this.registry.set(type, component);
    }

    getComponent(type: string): Type<ICellComponent> {
        return this.registry.get(type) || TextCellComponent; // Fallback to Text
    }
}

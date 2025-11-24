import { Injectable, Type } from '@angular/core';
import { ICellComponent, CellComponentType } from '../models/cell.interface';
import { TextCellComponent } from '../components/cells/text-cell/text-cell.component';
import { NumberCellComponent } from '../components/cells/number-cell/number-cell.component';
import { CheckboxCellComponent } from '../components/cells/checkbox-cell/checkbox-cell.component';
import { StatusCellComponent } from '../components/cells/status-cell/status-cell.component';
import { DateCellComponent } from '../components/cells/date-cell/date-cell.component';
import { PeopleCellComponent } from '../components/cells/people-cell/people-cell.component';
import { TagsCellComponent } from '../components/cells/tags-cell/tags-cell.component';

@Injectable({ providedIn: 'root' })
export class CellRegistryService {
    private registry = new Map<string, CellComponentType>();

    constructor() {
        this.register('TEXT', TextCellComponent);
        this.register('NUMBER', NumberCellComponent);
        this.register('CHECKBOX', CheckboxCellComponent);
        this.register('STATUS', StatusCellComponent);
        this.register('DATE', DateCellComponent);
        this.register('PEOPLE', PeopleCellComponent);
        this.register('TAGS', TagsCellComponent);
    }

    register(type: string, component: CellComponentType) {
        this.registry.set(type, component);
    }

    getComponent(type: string): CellComponentType {
        return this.registry.get(type) || TextCellComponent; // Fallback to Text
    }
}


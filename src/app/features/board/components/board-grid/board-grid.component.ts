import { Component, input, computed, ChangeDetectionStrategy, output, viewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { BoardGroup, ColumnDef } from '../../models/board.model';
import { DisplayRow } from '../../models/grid.model';
import { GroupHeaderComponent } from '../rows/group-header/group-header.component';
import { GroupFooterComponent } from '../rows/group-footer/group-footer.component';
import { CellHostDirective } from '../../directives/cell-host.directive';

@Component({
    selector: 'app-board-grid',
    standalone: true,
    imports: [
        CommonModule,
        ScrollingModule,
        DragDropModule,
        GroupHeaderComponent,
        GroupFooterComponent,
        CellHostDirective
    ],
    templateUrl: './board-grid.component.html',
    styleUrls: ['./board-grid.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardGridComponent {
    groups = input.required<BoardGroup[]>();
    columns = input.required<ColumnDef[]>();

    toggleGroup = output<string>();
    cellUpdate = output<{ itemId: string, colId: string, val: any }>();
    addItem = output<string>();
    itemDrop = output<{ prevIndex: number, currIndex: number }>();

    viewport = viewChild(CdkVirtualScrollViewport);
    currentGroup = signal<BoardGroup | null>(null);

    // Flattening Logic
    flatRows = computed(() => {
        const rows: DisplayRow[] = [];
        const currentGroups = this.groups();

        for (const group of currentGroups) {
            // 1. Header
            rows.push({
                id: `${group.id}_header`,
                type: 'GROUP_HEADER',
                data: group,
                groupId: group.id
            });

            if (!group.isCollapsed) {
                // 2. Items
                for (const item of group.items) {
                    rows.push({
                        id: item.id,
                        type: 'TASK_ROW',
                        data: item,
                        groupId: group.id
                    });
                }
                // 3. Footer
                rows.push({
                    id: `${group.id}_footer`,
                    type: 'GROUP_FOOTER',
                    data: group,
                    groupId: group.id
                });
            }
        }
        return rows;
    });

    // CSS Grid Template for Columns
    gridTemplate = computed(() => {
        // 1st col is sticky name (300px), then dynamic cols
        const colWidths = this.columns().map(c => `${c.width}px`).join(' ');
        return `300px ${colWidths}`; // Name column + dynamic columns
    });

    trackByFn(_: number, item: DisplayRow) {
        return item.id;
    }

    onToggleGroup(groupId: string) {
        this.toggleGroup.emit(groupId);
    }

    onCellUpdate(itemId: string, colId: string, val: any) {
        this.cellUpdate.emit({ itemId, colId, val });
    }

    onAddItem(groupId: string) {
        this.addItem.emit(groupId);
    }

    onDrop(event: CdkDragDrop<DisplayRow[]>) {
        // Only allow reordering if we are dragging a task row
        const item = this.flatRows()[event.previousIndex];
        if (item.type === 'TASK_ROW') {
            this.itemDrop.emit({
                prevIndex: event.previousIndex,
                currIndex: event.currentIndex
            });
        }
    }

    onScroll(index: number) {
        const rows = this.flatRows();
        if (!rows || rows.length === 0 || index >= rows.length) return;

        const row = rows[index];
        if (row) {
            const group = this.groups().find(g => g.id === row.groupId);
            this.currentGroup.set(group || null);
        }
    }
}

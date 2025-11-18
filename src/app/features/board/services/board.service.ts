import { Injectable, signal } from '@angular/core';
import { Board, BoardGroup, ColumnDef } from '../models/board.model';

@Injectable({ providedIn: 'root' })
export class BoardService {
    // Mock Data
    private initialColumns: ColumnDef[] = [
        {
            id: 'col_status',
            type: 'STATUS',
            title: 'Status',
            width: 140,
            settings: {
                labels: {
                    'Done': { text: 'Done', color: '#00c875' },
                    'Stuck': { text: 'Stuck', color: '#e2445c' },
                    'Working': { text: 'Working', color: '#fdab3d' },
                    'Pending': { text: 'Pending', color: '#579bfc' },
                    '': { text: '', color: '#c4c4c4' }
                }
            }
        },
        { id: 'col_date', type: 'DATE', title: 'Date', width: 120, settings: { mode: 'date' } },
        { id: 'col_deadline', type: 'DATE', title: 'Deadline', width: 160, settings: { mode: 'datetime' } },
        { id: 'col_quarter', type: 'DATE', title: 'Quarter', width: 100, settings: { mode: 'quarter' } },
        { id: 'col_person', type: 'TEXT', title: 'Person', width: 100 },
        { id: 'col_budget', type: 'NUMBER', title: 'Budget', width: 100 },
        { id: 'col_done', type: 'CHECKBOX', title: 'Done?', width: 80 }
    ];

    private initialGroups: BoardGroup[] = [
        {
            id: 'g1',
            title: 'This Week',
            color: '#579bfc',
            isCollapsed: false,
            items: [
                {
                    id: 'i1', boardId: 'b1', groupId: 'g1', name: 'Design Login Page',
                    values: {
                        'col_status': 'Done',
                        'col_date': '2023-10-01',
                        'col_deadline': '2023-10-01T14:30',
                        'col_quarter': 'Q4',
                        'col_person': 'Alice',
                        'col_budget': 500,
                        'col_done': true
                    }
                },
                {
                    id: 'i2', boardId: 'b1', groupId: 'g1', name: 'Fix API Bug',
                    values: {
                        'col_status': 'Stuck',
                        'col_date': '2023-10-02',
                        'col_deadline': '2023-10-02T09:00',
                        'col_quarter': 'Q4',
                        'col_person': 'Bob',
                        'col_budget': 0,
                        'col_done': false
                    }
                }
            ]
        },
        {
            id: 'g2',
            title: 'Next Week',
            color: '#00c875',
            isCollapsed: false,
            items: [
                {
                    id: 'i3', boardId: 'b1', groupId: 'g2', name: 'Write Documentation',
                    values: {
                        'col_status': 'Working',
                        'col_date': '2023-10-05',
                        'col_deadline': '2023-10-05T17:00',
                        'col_quarter': 'Q4',
                        'col_person': 'Charlie',
                        'col_budget': 100,
                        'col_done': false
                    }
                },
                {
                    id: 'i4', boardId: 'b1', groupId: 'g2', name: 'Deploy to Prod',
                    values: {
                        'col_status': 'Pending',
                        'col_date': '2023-10-10',
                        'col_deadline': '2023-10-10T12:00',
                        'col_quarter': 'Q4',
                        'col_person': 'Dave',
                        'col_budget': 1000,
                        'col_done': false
                    }
                }
            ]
        }
    ];

    // Signals
    columns = signal<ColumnDef[]>(this.initialColumns);
    groups = signal<BoardGroup[]>(this.initialGroups);

    toggleGroup(groupId: string) {
        this.groups.update(groups =>
            groups.map(g => g.id === groupId ? { ...g, isCollapsed: !g.isCollapsed } : g)
        );
    }

    updateCell(itemId: string, colId: string, val: any) {
        this.groups.update(groups => {
            return groups.map(group => ({
                ...group,
                items: group.items.map(item => {
                    if (item.id === itemId) {
                        return {
                            ...item,
                            values: { ...item.values, [colId]: val }
                        };
                    }
                    return item;
                })
            }));
        });
    }

    addGroup() {
        const newGroup: BoardGroup = {
            id: `g${Date.now()}`,
            title: 'New Group',
            color: '#a25ddc',
            isCollapsed: false,
            items: []
        };
        this.groups.update(groups => [newGroup, ...groups]);
    }

    addItem(groupId: string) {
        const newItem = {
            id: `i${Date.now()}`,
            boardId: 'b1',
            groupId: groupId,
            name: 'New Item',
            values: {}
        };

        this.groups.update(groups =>
            groups.map(g => {
                if (g.id === groupId) {
                    return { ...g, items: [...g.items, newItem] };
                }
                return g;
            })
        );
    }

    moveItem(prevIndex: number, currIndex: number) {
        // This is a simplified implementation. 
        // In a real app with flattening, we need to map flat indices back to group/item indices.
        // For now, let's assume we are just logging it or doing a basic reorder if it was a flat list.
        // Since we have groups, mapping is complex. 
        // Let's just log for now to prove the event fires, as full reordering logic with groups is complex.
        console.log('Move item from', prevIndex, 'to', currIndex);
    }
}

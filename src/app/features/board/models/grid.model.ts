import { BoardGroup, BoardItem } from './board.model';

export type RowType = 'GROUP_HEADER' | 'TASK_ROW' | 'GROUP_FOOTER';

export interface DisplayRow {
    id: string;       // Unique composite ID for trackBy
    type: RowType;
    data: any;        // BoardGroup | BoardItem
    groupId: string;
}

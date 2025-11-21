export interface ColumnSettings {
    labels?: Record<string, { text: string; color: string }>;
    allowMultiple?: boolean;
    [key: string]: any;
}

export type CellType = 'TEXT' | 'NUMBER' | 'CHECKBOX' | 'STATUS' | 'DATE' | 'PEOPLE' | 'TAGS';

export interface ColumnDef {
    id: string;
    type: CellType;
    title: string;
    width: number;
    settings?: ColumnSettings;
    pinned?: boolean;
    order?: number;
}

export interface BoardItem {
    id: string;
    boardId: string;
    groupId: string;
    name: string;
    values: Record<string, any>; // Key: ColId, Val: Data
    history?: any[];
}

export interface BoardGroup {
    id: string;
    title: string;
    color: string;
    isCollapsed: boolean;
    items: BoardItem[];
}

export interface Board {
    id: string;
    name: string;
    columns: ColumnDef[];
    groups: BoardGroup[];
}

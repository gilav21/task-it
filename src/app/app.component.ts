import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BoardGridComponent } from './features/board/components/board-grid/board-grid.component';
import { BoardService } from './features/board/services/board.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, BoardGridComponent],
  template: `
    <div class="app-container">
      <div class="app-header">
        <h1>Task-It Board</h1>
        <button (click)="generateData()">Generate Large Dataset</button>
      </div>
      <div class="board-wrapper">
        <app-board-grid 
          [groups]="boardService.groups()" 
          [columns]="boardService.columns()"
          (toggleGroup)="boardService.toggleGroup($event)"
          (cellUpdate)="onCellUpdate($event)"
          (addItem)="boardService.addItem($event)"
          (itemDrop)="boardService.moveItem($event.prevIndex, $event.currIndex)">
        </app-board-grid>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      font-family: 'Roboto', sans-serif; /* Or system-ui */
    }
    .app-header {
      padding: 16px;
      border-bottom: 1px solid #ccc;
      background: #fff;
      
      h1 {
        margin: 0;
        font-size: 20px;
      }
      
      button {
        margin-left: 20px;
        padding: 8px 16px;
        background: #0073ea;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        
        &:hover {
          background: #0060b9;
        }
      }
    }
    .board-wrapper {
      flex: 1;
      overflow: hidden;
    }
  `]
})
export class AppComponent {
  boardService = inject(BoardService);

  onCellUpdate(event: { itemId: string, colId: string, val: any }) {
    this.boardService.updateCell(event.itemId, event.colId, event.val);
  }

  generateData() {
    this.boardService.generateLargeDataset(100, 3000);
  }
}

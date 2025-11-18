import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardGroup } from '../../../models/board.model';

@Component({
    selector: 'app-group-header',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="group-header" [style.color]="group().color">
      <div class="collapse-icon" (click)="onToggle()">
        {{ group().isCollapsed ? '▶' : '▼' }}
      </div>
      <div class="group-title" [style.color]="group().color">
        {{ group().title }}
      </div>
      <div class="group-count">
        {{ group().items.length }} items
      </div>
    </div>
  `,
    styles: [`
    .group-header {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      font-weight: bold;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      height: 40px; /* Fixed height for virtual scroll */
      box-sizing: border-box;
      
      &:hover {
        background-color: rgba(0,0,0,0.02);
      }
    }
    .collapse-icon {
      margin-right: 8px;
      cursor: pointer;
      width: 20px;
      text-align: center;
    }
    .group-title {
      font-size: 18px;
      margin-right: 12px;
    }
    .group-count {
      font-size: 12px;
      color: #888;
      font-weight: normal;
    }
  `]
})
export class GroupHeaderComponent {
    group = input.required<BoardGroup>();
    toggleCollapse = output<string>();

    onToggle() {
        this.toggleCollapse.emit(this.group().id);
    }
}

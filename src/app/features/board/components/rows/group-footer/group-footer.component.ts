import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-group-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="group-footer">
      <div class="add-item-btn" (click)="onAddItem()">
        + Add Item
      </div>
    </div>
  `,
  styles: [`
    .group-footer {
      display: flex;
      align-items: center;
      padding-left: 40px; /* Indent to align with task names */
      height: 40px;
      border-bottom: 1px solid #e6e9ef;
      
      &:hover {
        background-color: #f5f6f8;
      }
    }
    .add-item-btn {
      color: #888;
      cursor: pointer;
      font-size: 14px;
      
      &:hover {
        color: #333;
      }
    }
  `]
})
export class GroupFooterComponent {
  groupId = input.required<string>();
  addItem = output<string>();

  onAddItem() {
    this.addItem.emit(this.groupId());
  }
}

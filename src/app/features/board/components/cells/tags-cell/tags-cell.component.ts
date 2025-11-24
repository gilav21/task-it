import { Component, input, output, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { FormsModule } from '@angular/forms';
import { ICellComponent } from '../../../models/cell.interface';
import { TagService, Tag } from '../../../services/tag.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-tags-cell',
  standalone: true,
  imports: [CommonModule, OverlayModule, FormsModule],
  template: `
    <div class="tags-container" (click)="toggleOpen()" cdkOverlayOrigin #trigger="cdkOverlayOrigin">
      <!-- Tags -->
      @for (tag of visibleTags(); track tag.id) {
        <div class="tag" [style.background-color]="tag.color">
          {{ tag.label }}
        </div>
      }
      
      <!-- Overflow Indicator -->
      @if (overflowCount() > 0) {
        <div class="tag overflow">
          +{{ overflowCount() }}
        </div>
      }

      <!-- Add Button (if empty) -->
      @if (tags().length === 0) {
        <div class="add-btn">+</div>
      }
    </div>

    <!-- Popover -->
    <ng-template cdkConnectedOverlay
                 [cdkConnectedOverlayOrigin]="trigger"
                 [cdkConnectedOverlayOpen]="isOpen()"
                 [cdkConnectedOverlayHasBackdrop]="true"
                 [cdkConnectedOverlayBackdropClass]="'cdk-overlay-transparent-backdrop'"
                 (backdropClick)="isOpen.set(false)">
      <div class="tags-popover">
        <!-- Search -->
        <div class="search-box">
          <input type="text" 
                 [ngModel]="searchQuery()" 
                 (ngModelChange)="searchQuery.set($event)" 
                 placeholder="Search or create tag..." 
                 autofocus>
        </div>

        <!-- Selected Tags -->
        @if (tags().length > 0) {
          <div class="section-title">Selected</div>
          <div class="list">
            @for (tag of tags(); track tag.id) {
              <div class="list-item selected">
                <div class="dot" [style.background-color]="tag.color"></div>
                <span class="name">{{ tag.label }}</span>
                <span class="remove-icon" (click)="removeTag(tag)">×</span>
              </div>
            }
          </div>
        }

        <!-- Search Results / Create -->
        <div class="section-title">Suggestions</div>
        <div class="list suggestions">
          @for (tag of searchResults(); track tag.id) {
            <div class="list-item" (click)="addTag(tag)">
              <div class="dot" [style.background-color]="tag.color"></div>
              <span class="name">{{ tag.label }}</span>
            </div>
          }
          
          <!-- Create Option -->
          @if (searchQuery() && !hasExactMatch()) {
            <div class="list-item create-option" (click)="createTag()">
              <div class="dot new">+</div>
              <span class="name">Create "{{ searchQuery() }}"</span>
            </div>
          }
          
          @if (searchResults().length === 0 && !searchQuery()) {
            <div class="empty-state">Type to search</div>
          }
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    .tags-container {
      display: flex;
      align-items: center;
      height: 100%;
      padding: 0 8px;
      gap: 4px;
      cursor: pointer;
      width: 100%;
      overflow: hidden;
    }
    .tag {
      padding: 2px 8px;
      border-radius: 12px;
      color: white;
      font-size: 11px;
      font-weight: 500;
      white-space: nowrap;
      max-width: 80px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .tag.overflow {
      background-color: #e6e9ef;
      color: #666;
    }
    .add-btn {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 1px dashed #ccc;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
      font-size: 14px;
    }
    
    /* Popover Styles */
    .tags-popover {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      width: 240px;
      padding: 12px;
      border: 1px solid #eee;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .search-box input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    }
    .section-title {
      font-size: 11px;
      font-weight: 600;
      color: #888;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .list {
      display: flex;
      flex-direction: column;
      gap: 4px;
      max-height: 200px;
      overflow-y: auto;
    }
    .list-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .list-item:hover {
      background: #f5f6f8;
    }
    .list-item.selected {
      background: #e3f2fd;
    }
    .dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    .dot.new {
      background: #eee;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: #666;
    }
    .name {
      font-size: 13px;
      color: #333;
      flex: 1;
    }
    .remove-icon {
      color: #999;
      font-size: 16px;
      padding: 0 4px;
    }
    .remove-icon:hover {
      color: #e2445c;
    }
    .empty-state {
      padding: 8px;
      text-align: center;
      color: #999;
      font-size: 13px;
    }
  `]
})
export class TagsCellComponent implements ICellComponent {
  value = input.required<any>(); // Array of { id, label, color }
  config = input<any>();
  valueChange = output<any>();

  private tagService = inject(TagService);

  // State
  isOpen = signal(false);
  searchQuery = signal('');

  // Computed
  tags = computed(() => {
    const val = this.value();
    if (!Array.isArray(val)) return [];
    return val;
  });

  visibleTags = computed(() => {
    return this.tags().slice(0, 2); // Show max 2 tags
  });

  overflowCount = computed(() => {
    return Math.max(0, this.tags().length - 2);
  });

  // Search Logic
  searchResults = toSignal(
    toObservable(this.searchQuery).pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query) return of([]);
        return this.tagService.searchTags(query);
      })
    ),
    { initialValue: [] }
  );

  hasExactMatch = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.searchResults().some(t => t.label.toLowerCase() === query);
  });

  toggleOpen() {
    this.isOpen.set(!this.isOpen());
    if (this.isOpen()) {
      this.searchQuery.set('');
    }
  }

  addTag(tag: Tag) {
    const current = this.tags();
    if (!current.find(t => t.id === tag.id)) {
      const newValue = [...current, tag];
      this.valueChange.emit(newValue);
    }
    this.searchQuery.set('');
  }

  createTag() {
    const label = this.searchQuery();
    if (!label) return;

    this.tagService.createTag(label).subscribe(newTag => {
      this.addTag(newTag);
    });
  }

  removeTag(tag: any) {
    const current = this.tags();
    const newValue = current.filter(t => t.id !== tag.id);
    this.valueChange.emit(newValue);
  }

  focus() {
    this.toggleOpen();
  }

  static getLightweightView(value: any, config: any): HTMLElement {
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.padding = '0 8px';
    container.style.boxSizing = 'border-box';
    container.style.overflow = 'hidden';
    container.style.gap = '4px';

    const tags = Array.isArray(value) ? value : [];

    tags.slice(0, 2).forEach((tag: any) => {
      const pill = document.createElement('div');
      // Handle both string tags and object tags if applicable
      const text = typeof tag === 'string' ? tag : (tag.label || tag.title || tag.name || '');
      pill.textContent = text;
      pill.style.backgroundColor = '#f0f0f0';
      pill.style.color = '#666';
      pill.style.padding = '2px 8px';
      pill.style.borderRadius = '12px';
      pill.style.fontSize = '11px';
      pill.style.whiteSpace = 'nowrap';
      container.appendChild(pill);
    });

    return container;
  }
}

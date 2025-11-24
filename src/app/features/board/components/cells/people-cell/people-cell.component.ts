import { Component, input, output, computed, signal, inject, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { FormsModule } from '@angular/forms';
import { ICellComponent } from '../../../models/cell.interface';
import { PeopleService, Person } from '../../../services/people.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, switchMap, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-people-cell',
  standalone: true,
  imports: [CommonModule, OverlayModule, FormsModule],
  template: `
    <div class="people-container" (click)="toggleOpen()" cdkOverlayOrigin #trigger="cdkOverlayOrigin">
      <!-- Avatars -->
      @for (person of visiblePeople(); track person.id) {
        <div class="avatar" [style.background-color]="person.color" [title]="person.name">
          {{ person.initials }}
        </div>
      }
      
      <!-- Overflow Indicator -->
      @if (overflowCount() > 0) {
        <div class="avatar overflow">
          +{{ overflowCount() }}
        </div>
      }

      <!-- Add Button (if empty) -->
      @if (people().length === 0) {
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
      <div class="people-popover">
        <!-- Search -->
        <div class="search-box">
          <input type="text" 
                 [ngModel]="searchQuery()" 
                 (ngModelChange)="searchQuery.set($event)" 
                 placeholder="Search people..." 
                 autofocus>
        </div>

        <!-- Selected People -->
        @if (people().length > 0) {
          <div class="section-title">Selected</div>
          <div class="list">
            @for (person of people(); track person.id) {
              <div class="list-item selected">
                <div class="avatar-small" [style.background-color]="person.color">{{ person.initials }}</div>
                <span class="name">{{ person.name }}</span>
                <span class="remove-icon" (click)="removePerson(person)">×</span>
              </div>
            }
          </div>
        }

        <!-- Search Results -->
        <div class="section-title">Suggestions</div>
        <div class="list suggestions">
          @for (person of searchResults(); track person.id) {
            <div class="list-item" (click)="addPerson(person)">
              <div class="avatar-small" [style.background-color]="person.color || '#ccc'">
                {{ getInitials(person.name) }}
              </div>
              <span class="name">{{ person.name }}</span>
            </div>
          }
          @if (searchResults().length === 0) {
            <div class="empty-state">No people found</div>
          }
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    .people-container {
      display: flex;
      align-items: center;
      height: 100%;
      padding: 0 8px;
      gap: -4px;
      cursor: pointer;
      width: 100%;
    }
    .avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 10px;
      font-weight: bold;
      border: 2px solid white;
      margin-right: -6px;
      flex-shrink: 0;
    }
    .avatar.overflow {
      background-color: #c4c4c4;
      color: #fff;
      z-index: 5;
    }
    .add-btn {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 1px dashed #ccc;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666;
      font-size: 14px;
      margin-left: 4px;
    }
    
    /* Popover Styles */
    .people-popover {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      width: 260px;
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
    .avatar-small {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 9px;
      font-weight: bold;
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
export class PeopleCellComponent implements ICellComponent {
  value = input.required<any>(); // Array of { id, name, color }
  config = input<any>();
  valueChange = output<any>();

  private peopleService = inject(PeopleService);

  // State
  isOpen = signal(false);
  searchQuery = signal('');

  // Computed for Display
  people = computed(() => {
    const val = this.value();
    if (!Array.isArray(val)) return [];
    return val.map(v => ({
      ...v,
      initials: this.getInitials(v.name),
      color: v.color || '#ccc'
    }));
  });

  visiblePeople = computed(() => {
    return this.people().slice(0, 3);
  });

  overflowCount = computed(() => {
    return Math.max(0, this.people().length - 3);
  });

  // Search Logic
  searchResults = toSignal(
    toObservable(this.searchQuery).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.peopleService.searchPeople(query))
    ),
    { initialValue: [] }
  );

  toggleOpen() {
    this.isOpen.set(!this.isOpen());
    if (this.isOpen()) {
      this.searchQuery.set(''); // Reset search on open
    }
  }

  addPerson(person: Person) {
    const current = this.people();
    if (!current.find(p => p.id === person.id)) {
      // Add simplified person object to value
      const newValue = [...(Array.isArray(this.value()) ? this.value() : []), {
        id: person.id,
        name: person.name,
        color: person.color
      }];
      this.valueChange.emit(newValue);
    }
    this.searchQuery.set('');
  }

  removePerson(person: any) {
    const current = Array.isArray(this.value()) ? this.value() : [];
    const newValue = current.filter((p: any) => p.id !== person.id);
    this.valueChange.emit(newValue);
  }

  getInitials(name: string): string {
    return name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
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
    container.style.paddingLeft = '8px';

    const people = Array.isArray(value) ? value : [];

    people.slice(0, 3).forEach((p: any, i: number) => {
      const circle = document.createElement('div');
      circle.style.width = '24px';
      circle.style.height = '24px';
      circle.style.borderRadius = '50%';
      circle.style.backgroundColor = '#e0e0e0';
      circle.style.border = '2px solid white';
      circle.style.marginLeft = i === 0 ? '0' : '-8px';
      circle.style.flexShrink = '0';
      container.appendChild(circle);
    });

    return container;
  }
}

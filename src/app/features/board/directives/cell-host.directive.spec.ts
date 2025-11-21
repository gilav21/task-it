import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CellHostDirective } from './cell-host.directive';
import { CellRegistryService } from '../services/cell-registry.service';
import { By } from '@angular/platform-browser';

@Component({
  template: `
    <ng-container appCellHost
      [cellType]="type()"
      [cellValue]="value()"
      [cellConfig]="config()">
    </ng-container>
  `,
  imports: [CellHostDirective],
  standalone: true
})
class TestHostComponent {
  type = signal('TEXT');
  value = signal<any>('123');
  config = signal({});
}

describe('CellHostDirective Bug', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, CellHostDirective],
      providers: [CellRegistryService]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should preserve value when cell type changes', async () => {
    // Initial state: TEXT cell with "123"
    let cellEl = fixture.debugElement.query(By.css('.cell-value'));
    expect(cellEl.nativeElement.textContent.trim()).toBe('123');

    // Change type to NUMBER
    component.type.set('NUMBER');
    fixture.detectChanges();
    await fixture.whenStable(); // Wait for effect

    // Check if new component is created (NumberCellComponent)
    const numberCell = fixture.debugElement.query(By.css('.number-cell'));
    expect(numberCell).toBeTruthy();

    const valueSpan = numberCell.query(By.css('.cell-value'));
    // If bug exists, value will be 0 (default of NumberCellComponent)
    expect(valueSpan.nativeElement.textContent.trim()).toBe('123');
  });
});

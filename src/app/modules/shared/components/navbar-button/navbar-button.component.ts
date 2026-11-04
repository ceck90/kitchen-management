import {Component, EventEmitter, Input, Output, ChangeDetectionStrategy} from '@angular/core';

@Component({
    selector: 'navbar-button',
    template: `
    <button (click)="onClick.emit()"
      [ngClass]="active ? 'active' : ''"
      [pTooltip]="title"
      [showDelay]="500"
      tooltipPosition="top">
      @if (!badged) {
        <i class="pi {{icon}}"></i>
      }
      @if (badged) {
        <p-overlay-badge [value]="' '">
          <i class="pi {{icon}}"></i>
        </p-overlay-badge>
      }
    </button>
    `,
    styleUrls: ['navbar-button.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class NavbarButtonComponent {

  @Input() public icon!: string;
  @Input() public active: boolean = false;
  @Input() public badged: boolean = false;
  @Input() public badgeCounter?: number | null;
  @Input() public title!: string;

  @Output() public onClick: EventEmitter<void> = new EventEmitter<void>(true);
}

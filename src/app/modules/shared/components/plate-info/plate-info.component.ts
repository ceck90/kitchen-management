import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ChangeDetectionStrategy} from '@angular/core';
import {Plate} from "../../../plates/plate.interface";

@Component({
    selector: 'plate-info',
    template: `
    <div class="plate-card" [class.disabled]="!config.enabled">
      <div class="plate-header" [style.background]="getHeaderGradient()">
        <div class="plate-icon" [style.backgroundColor]="config.color!">
          <i class="pi pi-inbox"></i>
        </div>
        <div class="plate-info">
          <h4>{{config.name}}</h4>
          @if (config.slot) {
            <span class="plate-number">#{{config.slot[1]}}</span>
          }
        </div>
        <div class="plate-status">
          <p-tag [severity]="config.enabled ? config._severity! : 'secondary'"
          [value]="!config.enabled ? 'SPENTO' : config._status!"></p-tag>
        </div>
      </div>
    
      <div class="plate-actions">
        <p-button
          type="button"
          [icon]="config.enabled ? 'pi pi-power-off' : 'pi pi-check'"
          [class]="config.enabled ? 'p-button-warning p-button-sm' : 'p-button-success p-button-sm'"
          [label]="config.enabled ? 'Spegni' : 'Accendi'"
          [pTooltip]="config.enabled ? 'Spegni la piastra' : 'Accendi la piastra'"
          tooltipPosition="top"
          (click)="onSwitchClick()">
        </p-button>
        <p-button
          type="button"
          icon="pi pi-pencil"
          styleClass="p-button-info p-button-sm"
          label="Modifica"
          pTooltip="Modifica piastra"
          tooltipPosition="top"
          (click)="edit.emit(config.id)">
        </p-button>
        <p-button
          type="button"
          icon="pi pi-trash"
          styleClass="p-button-danger p-button-sm"
          label="Elimina"
          pTooltip="Elimina piastra"
          tooltipPosition="top"
          (click)="delete.emit(config.id)">
        </p-button>
      </div>
    </div>
    `,
    styleUrls: ['./plate-info.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class PlateInfoComponent implements OnChanges {

  @Input() config!: Plate;

  @Output() delete: EventEmitter<string> = new EventEmitter<string>(false);
  @Output() edit: EventEmitter<string> = new EventEmitter<string>(false);
  @Output() switch: EventEmitter<{ id: string, enable: boolean }> = new EventEmitter<{ id: string, enable: boolean }>(false);

  public hideEdit: boolean = false;
  public hideDelete: boolean = false;
  public icon: SwitchIcon = 'pi-sun';

  getHeaderGradient(): string {
    if (!this.config.enabled) {
      return 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)';
    }
    return 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.icon = this.config.enabled ? 'pi-sun' : 'pi-moon';
  }

  public toggleIcon(): void {
    this.icon = this.icon === 'pi-sun' ? 'pi-moon' : 'pi-sun';
  }

  public onSwitchClick() {
    this.switch.emit({id: this.config.id!, enable: !this.config.enabled});
  }
}

type SwitchIcon = 'pi-moon' | 'pi-sun';

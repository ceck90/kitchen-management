import {Component, EventEmitter, Input, NgModule, OnDestroy, OnInit, Output, ChangeDetectionStrategy} from '@angular/core';
import {ItemEvent, Plate, PlateMenuItemAction, PlateItemStatus} from "../plate.interface";
import {PlateMenuItem, Status} from "../../plate-menu-items/plate-menu-item";
import {MenuItem as PrimeMenuItem} from 'primeng/api';
import {CommonModule} from "@angular/common";
import {RippleModule} from "primeng/ripple";
import {ButtonModule} from "primeng/button";
import {TooltipModule} from "primeng/tooltip";
import {TagModule} from "primeng/tag";
import {DelayThresholdsService} from "../../../services/delay-thresholds.service";
import {I18nService} from "../../../services/i18n.service";

@Component({
    selector: 'item',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ItemComponent implements OnInit, OnDestroy {

  @Input() public config!: PlateMenuItem;
  @Input() public plateList: Plate[] = [];
  @Input() public readonly: boolean = false;
  @Input() public showDelay: boolean = true; // default true per vista espansa
  @Input() public currentPlate?: Plate; // Configurazione della piastra corrente
  /** Tutti gli item dello stesso ordine mostrati in un'unica tile (piastre con raggruppamento per ordine) */
  @Input() public groupItems: PlateMenuItem[] = [];

  @Output() public onDoneEvent: EventEmitter<ItemEvent> = new EventEmitter<ItemEvent>(false);
  @Output() public onCancelEvent: EventEmitter<ItemEvent> = new EventEmitter<ItemEvent>(false);

  public deleteOptions: PrimeMenuItem[] = [];
  public deleteOverlay: boolean = false;
  public showPlateList: boolean = false;
  
  // Delay tracking per item
  public delayMinutes: number = 0;
  public delaySeverity: 'success' | 'warning' | 'danger' = 'success';
  public readonly i18n: any;

  private _delayUpdateInterval: any;

  constructor(private _delayThresholdsService: DelayThresholdsService,
              public i18nService: I18nService) {
    this.i18n = i18nService.instance;
  }

  public ngOnInit(): void {
    this.calculateItemDelay();
    this._delayUpdateInterval = setInterval(() => {
      this.calculateItemDelay();
    }, 60000);
    this.deleteOptions = [
      {
        icon: 'pi pi-trash',
        label: 'Elimina',
        command: () => {
          this.onCancel(Status.Cancelled);
        }
      },
      {
        icon: 'pi pi-undo',
        label: 'Rimetti in Attesa',
        command: () => {
          this.onCancel(Status.Todo);
        }
      },
      {
        icon: 'pi pi-directions',
        label: 'Sposta in altra Piastra',
        command: () => {
          this.showPlateList = true;
        }
      },
      {
        icon: 'pi pi-chevron-up',
        label: 'Annulla',
        command: () => {
          this.toggleOverlay();
        }
      },
    ];
  }

  public onDone(): void {
    this.onDoneEvent.emit({
      action: Status.Done,
      item: this.config,
      items: this.isGroup ? this.groupItems : undefined
    } as ItemEvent);
  }

  public onCancel(status: PlateMenuItemAction): void {
    const event: ItemEvent = {
      action: status,
      item: this.config,
      items: this.isGroup ? this.groupItems : undefined
    } as ItemEvent;

    this.onCancelEvent.emit(event);
    this.toggleOverlay();
  }

  public ngOnDestroy(): void {
    if (this._delayUpdateInterval) {
      clearInterval(this._delayUpdateInterval);
    }
  }

  public toggleOverlay(): void {
    this.deleteOverlay = !this.deleteOverlay;
    this.showPlateList = false;
  }

  public onPlateMoved(plate: Plate): void {
    const event: ItemEvent = {
      action: PlateItemStatus.Moved,
      item: this.config,
      items: this.isGroup ? this.groupItems : undefined,
      nextId: plate.id,
      plateId: '' // Sarà impostato dal componente parent
    } as ItemEvent;

    this.onCancelEvent.emit(event);
    this.toggleOverlay();
  }

  public onQuickMove(): void {
    if (!this.currentPlate?.quickMoveEnabled || !this.currentPlate?.quickMoveTargetPlateId) {
      return;
    }

    const targetPlate = this.plateList.find(p => p.id === this.currentPlate?.quickMoveTargetPlateId);
    if (targetPlate) {
      const event: ItemEvent = {
        action: PlateItemStatus.Moved,
        item: this.config,
        items: this.isGroup ? this.groupItems : undefined,
        nextId: targetPlate.id,
        plateId: '' // Sarà impostato dal componente parent
      } as ItemEvent;
      
      this.onCancelEvent.emit(event);
    }
  }

  public getTargetPlateName(): string {
    if (!this.currentPlate?.quickMoveTargetPlateId) {
      return '';
    }
    const targetPlate = this.plateList.find(p => p.id === this.currentPlate?.quickMoveTargetPlateId);
    return targetPlate?.name || '';
  }

  public get isGroup(): boolean {
    return this.groupItems.length > 1;
  }

  /**
   * Righe della tile raggruppata: gli item con lo stesso nome e le stesse note vengono sommati (es. "2 × Panino")
   */
  public get groupLines(): { name: string; quantity: number; notes: string }[] {
    const lines = new Map<string, { name: string; quantity: number; notes: string }>();
    for (const item of this.groupItems) {
      const notes = (item.notes || '').trim();
      const key = `${item.menuItem?.id}|${notes}`;
      const line = lines.get(key);
      if (line) {
        line.quantity++;
      } else {
        lines.set(key, {name: item.menuItem?.name || '', quantity: 1, notes});
      }
    }
    return [...lines.values()];
  }

  public getNotes(config: PlateMenuItem): string {
    let result = '';
    if (config.orderNotes && config.orderNotes.length) {
      result = config.orderNotes.trim();
    }
    if (config.notes && config.notes.length) {
      if (result.length) result += ' / ';
      result += config.notes.trim();
    }
    return result;
  }

  /**
   * Calcola il ritardo per questo specifico item
   */
  private calculateItemDelay(): void {
    if (!this.config?.createdDate) {
      this.delayMinutes = 0;
      this.delaySeverity = 'success';
      return;
    }

    const now = new Date().getTime();
    const createdTime = new Date(this.config.createdDate).getTime();
    const delayMs = now - createdTime;
    this.delayMinutes = Math.floor(delayMs / 60000);

    // Determina la severità usando le soglie configurabili
    this.delaySeverity = this._delayThresholdsService.getSeverity(this.delayMinutes);
  }

  /**
   * Formatta i minuti in stringa leggibile
   */
  public getDelayLabel(): string {
    if (this.delayMinutes < 60) {
      return `${this.delayMinutes}min`;
    }
    const hours = Math.floor(this.delayMinutes / 60);
    const mins = this.delayMinutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }
}

@NgModule({
  imports: [CommonModule, RippleModule, ButtonModule, TooltipModule, TagModule],
  declarations: [ItemComponent],
  exports: [ItemComponent]
})
export class ItemComponentModule{
}

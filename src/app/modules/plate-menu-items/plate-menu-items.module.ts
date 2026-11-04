import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';

import {PlateMenuItemsRoutingModule} from './plate-menu-items-routing.module';
import {PlateMenuItemsComponent} from './plate-menu-items/plate-menu-items.component';
import {PlateMenuItemNewComponent} from './plate-menu-items-new/plate-menu-item-new.component';

import {TableModule} from 'primeng/table';
import {InputTextModule} from "primeng/inputtext";
import {IconFieldModule} from "primeng/iconfield";
import {InputIconModule} from "primeng/inputicon";
import {SharedModule} from "../shared/shared.module";
import {DatePickerModule} from "primeng/datepicker";
import {SelectModule} from "primeng/select";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {TreeSelectModule} from "primeng/treeselect";
import {InputNumberModule} from "primeng/inputnumber";
import {ToastModule} from "primeng/toast";
import {ToolbarModule} from "primeng/toolbar";
import {DialogModule} from "primeng/dialog";
import {ConfirmationService, MessageService} from "primeng/api";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {CardModule} from "primeng/card";
import {TabsModule} from "primeng/tabs";
import {SplitButtonModule} from "primeng/splitbutton";
import {DragDropModule} from "primeng/dragdrop";
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [
    PlateMenuItemsComponent,
    PlateMenuItemNewComponent
  ],
  imports: [
    CommonModule,
    TableModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    SharedModule,
    PlateMenuItemsRoutingModule,
    DatePickerModule,
    SelectModule,
    FormsModule,
    ReactiveFormsModule,
    TreeSelectModule,
    InputNumberModule,
    ToastModule,
    ToolbarModule,
    DialogModule,
    ConfirmDialogModule,
    CardModule,
    TabsModule,
    SplitButtonModule,
    DragDropModule,
    ToggleSwitchModule,
    TooltipModule,
    FormsModule
  ],
  providers: [MessageService, ConfirmationService, DatePipe]
})
export class PlateMenuItemsModule { }

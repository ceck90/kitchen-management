import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {MenuItemComponent} from './menu-item/menu-item.component';
import {CategoryComponent} from './category/category.component';
import {MenuItemListComponent} from './menu-item-list/menu-item-list.component';
import {TableModule} from 'primeng/table';
import {DialogModule} from "primeng/dialog";
import {InputTextModule} from "primeng/inputtext";
import {IconFieldModule} from "primeng/iconfield";
import {InputIconModule} from "primeng/inputicon";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ButtonModule} from "primeng/button";
import {RippleModule} from "primeng/ripple";
import {ColorPickerModule} from "primeng/colorpicker";
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ConfirmationService, MessageService} from 'primeng/api';
import {ToastModule} from "primeng/toast";
import {ScrollPanelModule} from "primeng/scrollpanel";
import {TooltipModule} from "primeng/tooltip";
import {TextareaModule} from "primeng/textarea";

const routes: Routes = [
  {
    path: '',
    component: MenuItemComponent
  }
];

@NgModule({
  declarations: [
    MenuItemComponent,
    CategoryComponent,
    MenuItemListComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    DialogModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ReactiveFormsModule,
    ButtonModule,
    RippleModule,
    ColorPickerModule,
    FormsModule,
    ConfirmDialogModule,
    ToastModule,
    ScrollPanelModule,
    TooltipModule,
    TextareaModule
  ],
  providers: [ConfirmationService, MessageService]
})
export class MenuItemModule {
}

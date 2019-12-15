import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RBTreeviewComponent } from './rbtreeview/rbtreeview.component';

@NgModule({
  declarations: [RBTreeviewComponent],
  imports: [
    CommonModule
  ],
  exports: [
    RBTreeviewComponent
  ]
})
export class RBTreeviewModule { }

import { NgModule } from '@angular/core';
import { RBGridModule } from './rbgrid/rbgrid.module';
import { RBTreeviewModule } from './rbtreeview/rbtreeview.module';

@NgModule({
  declarations: [],
  imports: [
      RBGridModule,
      RBTreeviewModule
  ],
  exports: [
      RBGridModule,
      RBTreeviewModule
    ]
})
export class RBComponentsModule { }

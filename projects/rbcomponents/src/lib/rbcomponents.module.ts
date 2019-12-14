import { NgModule } from '@angular/core';
import { RBComponentsComponent } from './rbcomponents.component';
import { RBGridModule } from './rbgrid/rbgrid.module';

@NgModule({
  declarations: [RBComponentsComponent],
  imports: [
      RBGridModule
  ],
  exports: [
      RBComponentsComponent,
      RBGridModule
    ]
})
export class RBComponentsModule { }

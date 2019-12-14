import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RBGridComponent } from './rbgrid/rbgrid.component';

@NgModule({
  declarations: [RBGridComponent],
  imports: [
    CommonModule,
    BrowserModule
  ],
  exports: [
    RBGridComponent
  ]
})
export class RBGridModule { }

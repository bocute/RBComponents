import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RBComponentsComponent } from './rbcomponents.component';

describe('RBComponentsComponent', () => {
  let component: RBComponentsComponent;
  let fixture: ComponentFixture<RBComponentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RBComponentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RBComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnLangComponent } from './btn-lang.component';

describe('BtnLangComponent', () => {
  let component: BtnLangComponent;
  let fixture: ComponentFixture<BtnLangComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BtnLangComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BtnLangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

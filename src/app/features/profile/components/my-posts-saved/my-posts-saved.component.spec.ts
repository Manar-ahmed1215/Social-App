import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyPostsSavedComponent } from './my-posts-saved.component';

describe('MyPostsSavedComponent', () => {
  let component: MyPostsSavedComponent;
  let fixture: ComponentFixture<MyPostsSavedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyPostsSavedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyPostsSavedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

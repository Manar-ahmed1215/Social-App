import { Component, EventEmitter, Output } from '@angular/core';
import { BtnLangComponent } from "../../../../shared/ui/btn-lang/btn-lang.component";
import { Input } from '@angular/core';

@Component({
  selector: 'app-side-left',
  imports: [BtnLangComponent],
  templateUrl: './side-left.component.html',
  styleUrl: './side-left.component.css',
})
export class SideLeftComponent {
  @Input() activeView: string = 'friendsPosts';
  @Output() categorySelected = new EventEmitter<string>
  selectCategory(category:string):void{
    this.activeView = category;
    this.categorySelected.emit(category)
  }
}

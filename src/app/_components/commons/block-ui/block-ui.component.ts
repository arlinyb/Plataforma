import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'commons-block-ui',
  templateUrl: "./block-ui.component.html",
  styleUrls: ["./block-ui.component.css"]
})
export class BlockUiComponent implements OnInit {

  public topPosition

  constructor() { }


  
  @Input()
  set localPositionInfo(topPosition_: any) {
      if (topPosition_ != undefined) {
          this.topPosition = topPosition_;

  
      }
  }

  ngOnInit() {
  }



}

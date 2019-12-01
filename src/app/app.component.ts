import { Component, OnInit, AfterContentChecked } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})

export class AppComponent implements OnInit, AfterContentChecked {

  public lang: string = 'zh';

  public param; 

  public textValue :string[];

  constructor(public translateService: TranslateService) {
    this.translateService.setDefaultLang('zh');
    this.translateService.use('zh');
  }
  
  changeLang(lang: string): void {
    console.log(lang);
    this.translateService.use(lang);
  }
  
  ngOnInit() {
    this.param = {value: 'Default.W'};
  }

  // ngAfterContentChecked生命周期钩子每当Angular完成被投影组件内容的变更检测之后调用
  ngAfterContentChecked() {
    // 从ts中返回翻译结果
    // 这里调用了translate异步获取翻译结果的get()方法
    this.translateService.get('language').subscribe({
      next: res => {
        this.textValue = res;
      }
    });
  }
  
}

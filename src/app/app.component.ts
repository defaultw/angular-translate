import { Component, OnInit } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})

export class AppComponent implements OnInit {

  public lang: string = 'zh';

  public param = {value: 'Default.W'};

  public textValue :string[];

  constructor(public translateService: TranslateService) {
    this.translateService.setDefaultLang('zh');
  }
  
  changeLang(lang: string): void {
    console.log(lang);
    this.translateService.use(lang);
  }

  // 异步获取翻译结果
  getTranslateValue(value: string, values?: string[]){
    this.translateService.get(value?value:values).subscribe((res: string) => {
      console.log(res);
    });
  }

  // 同步获取翻译结果
  instantTranslateValue(value : string) : string{
    return this.translateService.instant(value) as string;
  }

  ngOnInit() {
    // 调用服务获取翻译结果 打印
    this.getTranslateValue('hello');

    this.translateService.get(['i','love','angular frame']).subscribe((res) => {
      this.textValue = res;
      console.log(res);
    });
  }
}

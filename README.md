# angular8.x + ngx-translate实现国际化

本文将介绍ngx-translate在angular8.x中的使用，主要内容有ngx-translate的安装、前端json翻译模板的配置以及如何改造为请求后台获取翻译模板json。完成后整体应用文件目录结构如下：

```shell
|- src
|- |- app
|- |- |- app.component.css
|- |- |- app.component.html
|- |- |- app.component.ts
|- |- |- app.module.ts
|- |- assetss
|- |- |- i18n
|- |- |- |- en.json
|- |- |- |- zh.json
|- |- index.html
|- |- mian.ts
|- |- polyfills.ts
|- |- style.css
|- angular.json
|- package.json
```



## 一、安装

在安装之前需要确认自己使用的angular的版本，不同的版本的angular可能对应不同的ngx-translate的版本。本文使用的angular版本为8.0.0。安装版本说明如下：

| Angular    | @ngx-translate/core | @ngx-translate/http-loader |
| ---------- | ------------------- | -------------------------- |
| 7/8        | 11.x+               | 4.x+                       |
| 6          | 10.x                | 3.x                        |
| 5          | 8.x to 9.x          | 1.x to 2.x                 |
| 4.3        | 7.x or less         | 1.x to 2.x                 |
| 2 to 4.2.x | 7.x or less         | 0.x                        |

>  此表格来源于ngx-translate官网，时间2019-12-1 11:16:28。

确认版本之后可以输入如下命令安装：

```shell
npm install @ngx-translate/core --save
npm install @ngx-translate/http-loader --save
```

如需要指定特定的版本可以参考如下命令：

```shell
npm install @ngx-translate/core@11.x --save
```



## 二、使用前端json翻译模板

### 1. 导入TranslateModule

要想在angular中使用`ngx-translate`，则必须将其在应用程序的根`@NgModule`中使用`TranslateModule.forRoot()`导入，`forRoot`静态方法是同时提供和配置服务的约定。确保只在应用程序的根模块中调用此方法，大多数情况下调用`AppModule`。如果需要在其他的`module`中使用，则需要在其他的`module`中使用`imports: [..., TranslateModule]`,和`exports:[..., TranslateModule]`。

```typescript
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';

@NgModule({
    imports: [
        BrowserModule,
        TranslateModule.forRoot()
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
```

### 2. 使用AoT

如果想要在使用`AoT`编译的同时配置自定义的`translateLoader`，那么这边的函数必须使用`export`修饰，即必须使用导出函数而不是内联函数。现在`AppModule`中代码需要改造为如下：

```typescript
// 包的导入省略......
// AoT
export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
@NgModule({
  // import中必须导入HttpClientModule，否则会报错'NullInjectorError: No provider for HttpClient!'
  imports:[ BrowserModule, FormsModule, HttpClientModule,
  TranslateModule.forRoot({
      loader: {
          provide: TranslateLoader,
          useFactory: (createTranslateLoader),
          deps: [HttpClient]
      }
  })],
  declarations: [ AppComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
```

这边的loader中的provide代表将`TranslateLoader`注入进来，而他的实现是由`useFactory`的`createTranslateLoader`来具体实现。

### 3. 配置json翻译模板

在2中可以看到`new TranslateHttpLoader(http, './assets/i18n/', '.json')`时已经指定了翻译模板的存放路径，所以现在需要在`assets`默认静态文件的存放目录下新建名为`i18n`的文件夹，并在其下新建`zh.json`和`en.json`翻译模板文件，如下：

```json
// en.json
// 注意：json文件中不要写注释！！！否则会报错
{
  "i18ntest":"Test Project For i18n",
  "hello": "Hello World !",
  "author":"author: {{value}}",
  "language":"language",
  "header": {
    "author": "Default.W"
  }
}
```

```json
// zh.jsons
{
  "hello": "你好, 世界!",
  "i18ntest":"测试项目(i18n)",
  "author":"作者： {{value}}",
  "language":"语言",
  "header": {
    "author": "Default.W"
  }
}
```

### 4. 使用

在AppComponent中使用，需要先将`TranslateService`导入进来，并且在构造函数处注入：

```typescript
constructor(public translateService: TranslateService) {
    this.translateService.setDefaultLang('zh'); // 设置当前的默认语言类型
    this.translateService.use('zh'); // 设置使用的语言类型
}
```

现在就可以在html中使用管道进行翻译了：

```html
<h1>{{'i18ntest' | translate}}</h1>
<p>{{'hello' | translate}}</p>
```

翻译还支持传值的翻译方式，html文件中的`param`为AppComponent中定义的变量：

```typescript
// AppComponent
public param;
ngOnInit() {
    this.param = {value: 'Default.W'};
}
```

```html
<!-- app.component.html -->
<p>{{"author" | translate:param}}</p>
```



## 三、从后台请求需要的翻译模板

如果不想在前台配置翻译模板的json文件，我们还可以在后端自行添加properties文件，并且不要自己写好一个后台接口来请求这个配置文件并组装成为json文件返回。在前端我们只需要将`translate.loader.ts`的中的`TranslateLoader`实现，并在实现中请求后端写好的接口就可以切换为后台的json。

```typescript
// 需要重新实现这个方法来请求后端接口
export abstract class TranslateLoader {
  abstract getTranslation(lang: string): Observable<any>;
}
```

实现代码示例：

```typescript
export class TranslateHttpLoader implements TranslateLoader {
    /**
    *  Get the translate from the service
    */
    public getTranslation(lang: string): Observable<Object> {
      	Subject subject = new Subject<any>();
        this.http.post(url).subscribe({
            next: res => {
                subject.next(res);
            },
            error: err => {
                console.log('获取失败');
            }
        });
        return subject;
    }
}
```



## 四、最终结果

### 1. 英文：

![en](https://github.com/defaultw/angular-translate/blob/master/src/assets/img/en.PNG?raw=true)

### 2. 中文

![zh](https://github.com/defaultw/angular-translate/blob/master/src/assets/img/zh.PNG?raw=true)

### 3. 完整代码

完整代码请查看[github](https://github.com/defaultw/angular-translate)。


## 五、参考文献

[1] [ngx-translate官方Github](https://github.com/ngx-translate/core)




[Edit on StackBlitz ⚡️](https://stackblitz.com/edit/angular-mgd7fr)

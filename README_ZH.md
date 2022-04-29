# vite-plugin-filesystem-multi-pages

基于文件生成路由、构建配置的开箱即用的MPA插件

- 开发模式自动映射路由地址. 和丑陋的 `https://localhost/src/pages/nested/nested/index.html` 说再见。 只需像SPA应用一样访问 `http://localhost/nested/nested` 即可。
- 自动化 MPA 的打包配置，不用再为每个页面配置 `input`
- 支持 All-in-one template 模式， 只需少量设置就可以让所有页面使用同一个 html 模板。


<p>
<a href="https://github.com/MinatoHikari/vite-plugin-filesystem-multi-pages/blob/main/README.md">English</a> | <b>简体中文</b>
<!-- Contributors: Thanks for geting interested, however we DON'T accept new transitions to the README, thanks. -->
</p>

### 安装

`npm i -D vite-plugin-filesystem-multi-pages`
或使用 yarn/pnpm

### 如何使用

```javascript
import fmp from 'vite-plugin-filesystem-multi-pages';

export default defineConfig({
    plugins: [fmp()],
});
```

### 配置项

```typescript
// 开始扫描的目录, 也就是文件系统的根目录，插件会扫描目录中内容配置相关构建和路由中间件
// 默认路径: 'src/pages'
dir: Pathlike
// 入口 html 文件名， 如果不配置 publicTemplateSrc 那么根目录和每个子目录都需要一个 html 作为入口
// 默认文件名: 'index.html'
templateName: string
// 如果 publicTemplateSrc !== '', 则启用 all-in-one template 模式
// 这种情况下可以所有的目录共用一个 html 文件作为入口
publicTemplateSrc: string
// 只在 all-in-one template 模式配置才会生效 
// 定义此项后, 目录下此文件存在, 此目录才会被识别为有效的页面, 并生成路由配置
// 默认文件名: 'main.ts'
scanFileName: string
// 只在 all-in-one template 模式配置才会生效 
// 传入一个对象, 对象内属性会替换公共 html 模版内相应的用 {{}} 包裹的内容
replace: Record<string, string | ((filePath:string) => string)>
// vite 默认的 mpa 构建设置，如果文件系统根目录在/src/pages/， 会打包到 /dist/src/pages/ 目录
// 如果你想要改变构建后的存放目录，可以修改此项
publicPath: string
```

举例说明文件系统如何运行, 如果文件系统跟目录为 `src/pages`, 目录树如下:

-   src/pages
    -   index.html
    -   nested
        -   index.html
        -   foo
            -   index.html
    -   bar
        -   index.html

那么可以访问的路由为 `['', '/nested', '/nested/foo', '/bar']`.

可以封装 `window.location.href` 进行页面跳转.

### All-in-one template 模式

如果文件系统根目录在 `src/pages`， 目录树如下:

-   index.html (public template)
-   src/pages
    -   main.ts
    -   nested
        -   main.ts
        -   foo
            -   main.ts
    -   bar
        -   main.ts

设置 `publicTemplateSrc` 为 `'path.resolve(__dirname, 'index.html')'`.

设置 `scanFileName` 为 `main.ts`

在公共的 `index.html` 内, 你可以使用 `{{ xxx }}` 去配置会被 `replace` 内属性替换的内容.

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{{title}}</title>
    </head>
    <body>
        <div id="app"></div>
        <script type="module" src="{{src}}/main.ts"></script>
    </body>
</html>
```

设置 `replace`:

```javascript
replace: {
  title: 'My title',
  src: (path) => path
}
```

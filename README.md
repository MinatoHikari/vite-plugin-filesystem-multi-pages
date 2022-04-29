# vite-plugin-filesystem-multi-pages

filesystem routes for mpa

### Install

`npm i -D vite-plugin-filesystem-multi-pages`
or use yarn/pnpm

### Usage

```javascript
import fmp from 'vite-plugin-filesystem-multi-pages';

export default defineConfig({
    plugins: [fmp()],
});
```

### Options

```typescript
// the directory to scan, valid routes will be
// reflected to browser location.
// default: 'src/pages'
dir: Pathlike
// the entry html name of each page.
// default: 'index.html'
templateName: string
// if publicTemplateSrc !== '', all-in-one template mode will be used
publicTemplateSrc: string
// only works in all-in-one template mode
// define which file to scan, if the file be detected, the folder will be added into routes
scanFileName: string
// only works in all-in-one template mode
// define variables which will replace the {{ xxx }} things in the public template
replace: Record<string, string | ((filePath:string) => string)>
// Normally, vite will place dist files in something like /dist/src/pages/...
// If you want to put them at other dir, you can set this option.
publicPath: string
```

As an example, if you have a directory named `src/pages`:

-   src/pages
    -   index.html
    -   nested
        -   index.html
        -   foo
            -   index.html
    -   bar
        -   index.html

Available routes are `['', '/nested', '/nested/foo', '/bar']`.

You can use `window.location.href` to change the route.

### All-in-one template mode

If you have a directory named `src/pages`:

-   index.html (public template)
-   src/pages
    -   main.ts
    -   nested
        -   main.ts
        -   foo
            -   main.ts
    -   bar
        -   main.ts

Set `publicTemplateSrc` to `'path.resolve(__dirname, 'index.html')'`.

Set `scanFileName` to `main.ts`

In `index.html`, you can use `{{ xxx }}` to set the variables which will be replaced by `replace`.

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

Set `replace`:

```javascript
replace: {
  title: 'My title',
  src: (path) => path
}
```

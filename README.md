# vite-plugin-filesystem-multi-pages
filesystem routes for mpa

### Install
`npm i -D vite-plugin-filesystem-multi-pages`
or use yarn/pnpm

### Usage 
```javascript
import fmp from 'vite-plugin-filesystem-multi-pages';

export default defineConfig({
    plugins: [
        fmp(),
    ],
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
```
As an example, if you have a directory named `src/pages`:

- src/pages
  - index.html
  - nested
    - index.html
    - foo
      - index.html
  - bar
    - index.html

Available routes are `['', '/nested', '/nested/foo', '/bar']`.

You can use `window.location.href` to change the route.

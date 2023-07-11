# vite-plugin-seo-prerender

`vite-plugin-seo-prerender` 插件是一个用于 `Vite` 构建工具的预渲染插件，它可以将你的单页面应用 (SPA) 在构建时静态预渲染为
HTML 文件，以提高首次加载速度和SEO友好性。适用于对站点少量页面生成静态HTML。支持 `Vue、React`等所有框架

***

+ 静态预渲染：将单页面应用在构建时预渲染为 HTML 文件。
+ SSG (静态站点生成)：支持根据路由配置生成静态 HTML 文件。
+ 异步数据获取：支持在构建时获取异步数据并注入到预渲染的 HTML 文件中。
+ SEO 友好：生成的静态 HTML 文件对搜索引擎友好，可以更好地被爬虫索引。
+ 支持纯静态：public 目录下的 .html 支持动态引入样式及公共部分。

## 安装使用

```shell
npm install vite-plugin-seo-prerender -D
# or
pnpm install vite-plugin-seo-prerender -D
# or
yarn install vite-plugin-seo-prerender -D
```

## 使用配置

```ts
// vite.config.ts
import {defineConfig} from 'vite'
import seoPrerender from 'vite-plugin-seo-prerender'

export default defineConfig({
  plugins: [
    seoPrerender({
      routes: [] // 需要生成的路由
    })
  ]
})
```

## 纯静态开发

**使用预渲染生成的html页面有一个弊端，如预渲染生成页面 `/about/index.html`，它并不能通过 `http://xxx.com/about/index.html`
这样的形式正常访问，即使能正常展示也会丢失脚本事件**

对于部分特殊需求需要纯静态页面时，插件同样支持在编写 `public` 目录下的 `.html`
文件时，同样支持热更新及引入项目由 `scss、less`等编写的公共样式。并可使用指定标签替换页面内容，如公共头尾部等。只需简单配置`publicHtml`即可

```html
 <!--/public/about/index.html-->
<body>
<div><!--link href="/src/assets/header.html"--></div>
<div>这里的路径需要使用相对于根目录的绝对路径，不能使用相对路径，如 ./assets/header.html</div>
<div>this page content</div>
</body>
```

在浏览器输入如 `http://localhost/contact/index.html` 即可看到被替换后的页面，当修改`scss/less`文件或当前 html 页改变时，可实现热更新。

## 发布

运行 `vite build` 构建命令时即可生成 HTML 文件

## API

| 参数          | 类型                  | 说明                                                                      |
|-------------|---------------------|-------------------------------------------------------------------------|
| puppeteer   | object              | puppeteer一些配置                                                           |
| routes      | string[]            | 生成预渲染的路由path                                                            |
| removeStyle | boolean             | 移除预览服务生成多余样式，默认true。如样式丢失，可设置为false                                     |
| callback    | funtion(html,route) | 预渲染和处理public下.html文件处理回调事件，可对需处理的页面进行修改，html为将要生成的文件内容,route当前处理的页面path |
| publicHtml  | boolean/string[]    | 需要处理的纯静态文件。true代表public整个目录下的html文件，数组时可指定文件，如['/contact/index.html']   |
| scss        | [{entry,outDir}]    | 需要编译的单独scss文件。专为单独纯html页面量身定制，可将独立(即没有在项目里引入)的scss转换为css                |


## 附：seo关键词优化路由设置

```ts
// router.ts
const routes = [
  {
    path: '/about',
    name: '/about',
    component: () => import('./views/about/index.vue'),
    meta: {
      title: '关于我们',
      keywords: '关键词1, 关键词2',
      description: '关于我们描述'
    }
  }
]

router.afterEach((to) => {
  const {title, keywords, description} = to.meta
  if (title) {
    document.title = title
  }
  if (keywords) {
    const metaKeywords = document.querySelector('meta[name="keywords"]')
    if (metaKeywords) {
      metaKeywords.content = keywords
    }
  }
  if (description) {
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.content = description
    }
  }
})
```

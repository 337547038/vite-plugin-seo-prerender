# vite-plugin-seo-prerender

`vite-plugin-seo-prerender` 插件是一个用于 `Vite` 构建工具的预渲染插件，它可以将你的单页面应用 (SPA) 在构建时静态预渲染为 HTML 文件，以提高首次加载速度和SEO友好性。适用于对站点少量页面生成静态HTML。支持 `Vue、React`等所有框架

***

+ 静态预渲染：将单页面应用在构建时预渲染为 HTML 文件。
+ SSG (静态站点生成)：支持根据路由配置生成静态 HTML 文件。
+ 异步数据获取：支持在构建时获取异步数据并注入到预渲染的 HTML 文件中。
+ SEO 友好：生成的静态 HTML 文件对搜索引擎友好，可以更好地被爬虫索引。


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
import { defineConfig } from 'vite' 
import seoPrerender from 'vite-plugin-seo-prerender'

export default defineConfig({
  plugins: [
    seoPrerender({
      puppeteer: {}, // puppeteer参数配置，可选
      routes: [], // 需要生成的路由，必填
      removeStyle:true, // 是否移除多余样式，默认true。在启动服务vite preview时会产生一些多余样式，如若丢失样式可设置为false
      callback:(content,route)=>{
        // 可对当前页面html内容进行一些替换等处理
        // 一些处理逻辑...
        return content
      }
    })
  ]
})
```


## 发布

运行 `vite build` 构建命令时即可生成HTML 文件

## 附seo关键词优化

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

router.afterEach((to, from, next) => {
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
  next()
})
```

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
//import seoPrerender from 'vite-plugin-seo-prerender'
import seoPrerender from './packages/src'
import {createHtmlPlugin} from 'vite-plugin-html'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    seoPrerender({
      routes: ['/about'],
      html: {
        routes: ['/contact/index.html']
      }
    })
    /*createHtmlPlugin({
      // 配置需要处理的HTML文件路径
      include: [/publ0ic\/.+\.html$/],
      // 处理HTML文件的回调函数
      transform(ctx) {
        // 编辑返回新内容
        console.log('transform',ctx)
        const { path, html } = ctx
        // 对html进行编辑，可以使用正则表达式或其他方式进行修改
        const newHtml = html.replace(/Hello/g, 'Hi')
        // 返回新的HTML内容
        return { html: 'newHtml' }
      }
    })*/
  ],
  base: './'
})

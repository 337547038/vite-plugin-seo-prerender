import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import seoPrerender from 'vite-plugin-seo-prerender'
//import seoPrerender from './packages/src'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    seoPrerender({
      hashHistory:true,　// 使用hash路由，需设置为true
      routes: ['/about', '/test', '/test1','/test2','/test3'],
      /*publicHtml: true,
      scss: [
        {entry: '/src/assets/test.scss', outDir: '/public/style/test.css'}
      ]*/
    })
  ]
})

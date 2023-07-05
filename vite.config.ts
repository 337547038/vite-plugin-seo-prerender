import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import seoPrerender from 'vite-plugin-seo-prerender'
//import seoPrerender from './packages/src'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    seoPrerender({
      routes: ['/about'],
      publishHtml: ['/contact/index.html']
    })
  ]
})

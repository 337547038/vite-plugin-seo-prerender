import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import {recursiveMkdir} from './utils'


const seoPrerender = async (config) => {
  const browser = await puppeteer.launch(Object.assign({headless: 'new'}, config.puppeteer || {}));
  const page = await browser.newPage()
  const logTip = '[vite-plugin-seo-prerender:routes]'
  for (const item of config.routes) {
    await page.goto(path.join(config.local, item))
    await page.setViewport({width: 1024, height: 768})
    let content = await page.content()
    if (config.removeStyle !== false) {
      // 若出现导常，可设置参数removeStyle:false
      content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
    }
    // 防止当设置了base:./形式时，会使用http的形式加载样式脚本资源，这里转为根路径
    // 这里其实还存在问题，当直接访问xx/index.html 插入的公共资源也为./这样的形式，是加载不到的
    const regLocal = new RegExp(config.local, 'g')
    content = content.replace(regLocal, '')

    if (config.callback) {
      content = config.callback(content, item) || content
    }
    if (item.indexOf('?') !== -1) {
      // 填写的路由地址带有意外参数时不处理
      console.log(`${logTip} ${item} is error,unexpected?`)
    } else {
      const fullPath = path.join(config.outDir, item)
      recursiveMkdir(fullPath)
      const filePath = path.join(fullPath, 'index.html')
      fs.writeFileSync(filePath, content)
      console.log(`${logTip} ${filePath.replace(/\\/g, '/')} is success!`)
    }
  }
  await browser.close();
  console.log(`${logTip} is complete`)
}
export default seoPrerender

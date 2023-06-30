import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

// 递归创建目录
function recursiveMkdir(dirPath) {
  const parentDir = path.dirname(dirPath); // 获取父级目录路径

  if (!fs.existsSync(parentDir)) {
    recursiveMkdir(parentDir); // 递归创建父级目录
  }

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath); // 创建当前目录
  }
}

const seoPrerender = async (config) => {
  const browser = await puppeteer.launch(Object.assign({headless: 'new'}, config.puppeteer || {}));
  const page = await browser.newPage()
  for (const item of config.routes) {
    await page.goto(config.local + item)
    await page.setViewport({width: 1024, height: 768})
    let content = await page.content()
    if (content.removeStyle !== false) {
      // 若出现导常，可设置参数removeStyle:false
      content = content.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
    }
    if (config.callback) {
      content = config.callback(content, item)
    }
    if (item.indexOf('?') !== -1) {
      // 填写的路由地址带有意外参数时不处理
      console.log(`[vite-plugin-seo-prerender] ${item} is error,unexpected?`)
    } else {
      const fullPath = path.join(config.outDir, item)
      recursiveMkdir(fullPath)
      const filePath = path.join(fullPath, 'index.html')
      fs.writeFileSync(filePath, content)
      console.log(`[vite-plugin-seo-prerender] ${filePath} is success!`)
    }
  }
  await browser.close();
  console.log('[vite-plugin-seo-prerender] is complete')
}
export default seoPrerender

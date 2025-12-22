import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import {recursiveMkdir, concurrency as concurrencyFn } from './utils'
import {URL} from 'url'
import type { Config } from './index'

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

interface PrenderConfig extends Config {
    outDir: string;
    mode: string;
    root: string;
    local: string;
    base: string;
    isProduction: boolean;
    command: string;
}

const seoPrerender = async (config: PrenderConfig) => {
  const browser = await puppeteer.launch(Object.assign({headless: 'new'}, config.puppeteer || {}));
  const logTip: string = '[vite-plugin-seo-prerender:routes]'
  let network = {}
  if (config.network) {
    network = {waitUntil: 'networkidle0'} // 等待所有请求结束
  }
  const href:string = new URL(config.base,config.local).toString().slice(0, -1) // 去掉最后一个/
  
  // 设置并发数，默认为1，应注意避免同时打开过多页面导致内存问题
  const total = config.routes.length
  let current = 0

  // 处理单个路由
  const processRoute = async (item: string) => {
    const page = await browser.newPage();
    try {
      let pageUrl: string = href + item
      if (config.hashHistory) {
        pageUrl = `${href}/#${item}`
      }
      await page.goto(pageUrl, network)
      await page.setViewport({width: 1024, height: 768})
      await page.waitForSelector('body')
      if(config.delay){
       await delay(config.delay)
      }
      let content: string = await page.content()
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
        //console.log(content)
        console.log(`[${current++}/${total}]${logTip} ${pageUrl.replace(config.local,'')} => ${filePath.replace(/\\/g, '/')} is success!`)
      }
    } finally {
      await page.close();
    }
  };

  const taskList = config.routes.map(item => () => processRoute(item));
  const concurrency = Math.min(Math.max(1, Number(config.concurrency || 1)), total);

  console.log(`${logTip} 开始预渲染，并发数: ${concurrency}`);
  await concurrencyFn(taskList, concurrency);

  await browser.close();
  console.log(`${logTip} is complete`)
}
export default seoPrerender

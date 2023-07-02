/*
处理public静态文件，两个功能
1.将页面的公共样式及脚本动态插入到静态页，实现样式共用；
2.静态html也可以使用公共如头尾部*/
import puppeteer from 'puppeteer'
import {Config} from "./types"

interface publicConfig extends Config {
  hostPort: string
  filePath: string
}

/**
 * 获取主入口index的style和script
 */
const getPublicIndex = async (config: publicConfig) => {
  const browser = await puppeteer.launch(Object.assign({headless: 'new'}, config.puppeteer || {}));
  const page = await browser.newPage()
  await page.goto(config.hostPort)
  await page.setViewport({width: 1024, height: 768})
  const htmlContent = await page.content()
  //提取link
  const styleRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi
  const matches = htmlContent.matchAll(styleRegex)
  console.log('style',matches)
  for (const match of matches) {
    const styleContent = match[1]
    // 处理style标签中的内容
    console.log(styleContent);
  }

}
const publicHtml = async (config: publicConfig, mode?: string) => {
  const styleScript = await getPublicIndex(config)
}
export default publicHtml

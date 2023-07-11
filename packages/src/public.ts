/*
处理public静态文件，两个功能
1.将页面的公共样式及脚本动态插入到静态页，实现样式共用；
2.静态html也可以使用公共如头尾部*/
import fs from 'fs'
import path from 'path'
import {getTransform} from './utils'

interface PublicConfig {
  root: string
  filePath: string | string[] | boolean
  mode: string
  outDir?: string
  callback?: Function
}

let scriptLink
/**
 * 提取index.html中的入口script和link
 * @param root 项目根目录 绝对位置路径
 * @param mode 模式 server/build
 * @param outDir 打包输出目录
 */
const getEntry = (root: string, mode: string, outDir?: string) => {
  // 从入口html页面获取
  const indexContent: string = fs.readFileSync(path.join(root, 'index.html'), 'utf-8')
  if (mode === 'server') {
    // 返回入口script即可 如/src/main.ts
    const scriptMain = /<script[^>]*?\b\/main\b[^>]*?>.*?<\/script>/gi
    const scripts = indexContent.match(scriptMain) || []
    return scripts.join('\n')
  } else {
    // 提取动态插入index.html的link
    const linkPattern = /<link[^>]*?rel=['|"]stylesheet['|"][^>]*?\.css[^>]*?>/gi
    //const linkPattern = /(?<=<link.*?href=["'])(.*?\.css)(?=["'].*?)/g
    const links = indexContent.match(linkPattern)
    // 编译后的index.html
    const newIndex: string = fs.readFileSync(path.join(root, outDir, 'index.html'), 'utf-8')
    const newLinks = newIndex.match(linkPattern) || []
    let resultLink: string[] = newLinks
    if (links) {
      resultLink = newLinks.filter((item: string) => !links.includes(item))
    }
    return resultLink.join('\n').replace('"./', '"/') // 将可能存在的href="./x"转为href="/"
  }
}

/**
 * 替换页面指定标签的内容
 * @param html
 * @param root
 */
const getReplaceComm = (html: string, root: string) => {
  return html.replace(/<!--link\shref="(.*)"-->/gi, function (matches: string, m1: string) {
    // m1就是匹配的路径地址了
    // 读取m1文件内容
    const dirPath = path.join(root, m1)
    //console.log('dirPath',dirPath)
    if (fs.existsSync(dirPath)) {
      return fs.readFileSync(dirPath, {
        encoding: 'utf8'
      })
    } else {
      // 文件不存在时
      return matches
    }
  })
}
/**
 * 根据路径替换需要处理的html文件
 * @param root 项目根目录 绝对路径
 * @param dirPath 文件路径位置 绝对路径
 * @param callback 回调处理事件
 */
const readWriteFile = (root: string, dirPath: string, callback: any) => {
  const content: string = fs.readFileSync(dirPath, 'utf-8')
  // 插入生成的css link
  let replaceContent: string = content.replace('</head>', `${scriptLink}\n</head>`)
  // 替换指定标签的内容
  replaceContent = getReplaceComm(replaceContent, root)
  if (typeof callback === 'function') {
    replaceContent = callback(replaceContent, dirPath) || replaceContent
  }
  fs.writeFileSync(dirPath, replaceContent)
  console.log('[vite-plugin-seo-prerender:publicHtml] ' + getTransform(path.relative(root, dirPath)))
}

/**
 * 查找发布目录下所有.html文件
 * @param dirPath
 * @param indexPath 首页的路径 如dist/index.html
 * @param root
 * @param callback 回调处理事件
 */
const findHTMLFiles = (dirPath: string, indexPath: string, root: string, callback: any) => {
  if (!fs.existsSync(dirPath)) {
    console.log(`${dirPath}路径不存在`)
    return
  }
  const paths: string[] = fs.readdirSync(dirPath)
  paths.forEach((item: string) => {
    // 如果是文件，则判断文件扩展名是否为html，排除根目录下的首页
    const itemPath: string = path.join(dirPath, item)
    if (fs.statSync(itemPath).isFile() && path.extname(itemPath) === '.html' && !getTransform(itemPath).endsWith(indexPath)) {
      readWriteFile(root, itemPath, callback)
    }
    // 如果是目录，则递归地调用函数查找子目录中的HTML文件
    if (fs.statSync(itemPath).isDirectory()) {
      findHTMLFiles(itemPath, indexPath, root, callback)
    }
  })
}

/**
 * 处理public目录下的html文件
 * @param config
 */
const publicHtml = async (config: PublicConfig) => {
  const {mode, root, filePath, outDir} = config
  if (!scriptLink) { // 减少下每次读取index.html
    scriptLink = getEntry(root, mode, outDir)
  }
  if (mode === 'server') {
    const htmlFilePath: string = path.join(root, 'public', filePath as string)
    let htmlContent: string = fs.readFileSync(htmlFilePath, 'utf-8')
    //将script插入到body
    htmlContent = htmlContent.replace('</body>', `${scriptLink}\n</body>`)
    //替换公共部分
    htmlContent = getReplaceComm(htmlContent, root)
    if (typeof config.callback === 'function') {
      htmlContent = config.callback(htmlContent, filePath) || htmlContent
    }
    return htmlContent
  } else {
    // 生产模式
    if (typeof filePath === 'boolean') {
      // 目录下的所有html文件
      const dirPath: string = path.join(root, outDir)
      const indexPath: string = getTransform(path.join(outDir, 'index.html'))
      findHTMLFiles(dirPath, indexPath, root, config.callback)
    } else {
      // 指定目录
      for (const key in filePath as string[]) {
        const dirPath: string = path.join(root, outDir, filePath[key])
        readWriteFile(root, dirPath, config.callback)
      }
    }
  }
}
export default publicHtml

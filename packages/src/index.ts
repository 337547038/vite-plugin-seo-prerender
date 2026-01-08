import type { Plugin } from 'vite'
import childProcess from 'child_process'
import path from 'path'
import fs from 'fs'
import * as sass from 'sass'
import prerender from './render'

// @ts-ignore
import publicHtml from './public'
import {getTransform, recursiveMkdir} from './utils'

interface Scss {
  entry: string
  outDir: string
}

export interface Config {
  /** 生成预渲染的路由path */
  routes: string[]
  /** puppeteer一些配置 */
  puppeteer?: any;
  /** 构建时是否获取异步数据并注入到预渲染的 HTML 文件中，默认false 。开启后构建速度相对会慢些 */
  network?: boolean
  /** 移除预览服务生成多余样式，默认true。如样式丢失，可设置为false */
  removeStyle?: boolean
  /** 预渲染和处理public下.html文件处理回调事件，可对需处理的页面进行修改，html为将要生成的文件内容,route当前处理的页面path */
  callback?: (html: string, route: string) => string
  /** 需要处理的其他纯静态文件。true代表public整个目录下的html文件，数组时可指定文件，如['/contact/index.html'] */
  publicHtml?: boolean | string[]
  /** 需要编译的单独scss文件。专为单独纯html页面量身定制，可将独立(即没有在项目里引入)的scss转换为css */
  scss?: { entry: string; outDir: string }[]
  /** 路由模式为hashHistory时需设置为true */
  hashHistory?: boolean
  /** 延时等待时间，确保页面加载完成 */
  delay?: number
  /** 并行处理数量。默认为 1，即不并行处理 */
  concurrency?: number
}

const getPublicHtml = (publicHtml: boolean | string[]) => {
  let allUrl: string[] = []
  if (typeof publicHtml === 'object') {
    // 处理指定的
    allUrl = publicHtml || []
  }
  const isAllUrl: boolean = typeof publicHtml === 'boolean' && publicHtml
  return {allUrl, isAllUrl}
}

/**
 * 将scss转换为css
 * @param root
 * @param css
 */
const transformSass = (root: string, css: Scss) => {
  const entryDir: string = path.join(root, css.entry)
  const result = sass.compile(entryDir)
  const outDir: string = path.join(root, css.outDir)
  recursiveMkdir(path.dirname(outDir))
  fs.writeFileSync(outDir, result.css)
  console.log(`transform scss: ${css.entry} => ${css.outDir}`)
}

const seoPrerender = (config: Config) => {
  const cfgConfig = {
    outDir: '',
    mode: '',
    root: '',
    local: '',
    base: '',
    isProduction:false,
    command:''
  }
  const configPublicHtml = config.publicHtml || false
  return {
    name: 'vitePluginSeoPrerender',
    enforce: 'post',
    configResolved(cfg: any) {
     //console.log('cfg',cfg)
      cfgConfig.outDir = cfg.build.outDir
      cfgConfig.mode = cfg.mode
      cfgConfig.root = cfg.root
      cfgConfig.base = cfg.base
      cfgConfig.isProduction=cfg.isProduction
      cfgConfig.command=cfg.command
    },
    buildStart() {
      if (config?.scss?.length) {
        config.scss.forEach((item: Scss) => {
          transformSass(cfgConfig.root, item)
        })
      }
    },
    configureServer(server: any) {
      const {allUrl, isAllUrl} = getPublicHtml(configPublicHtml)
      if (allUrl.length || isAllUrl) {
        server.middlewares.use(async (req: any, res: any, next: any) => {
          const baseUrl = decodeURIComponent(req.url.replace(cfgConfig.base, '/'))
          if ((isAllUrl && baseUrl.endsWith('.html')) || allUrl.includes(baseUrl)) {
            const htmlContent = await publicHtml({
              root: cfgConfig.root,
              filePath: baseUrl,
              mode: 'server',
              callback: config.callback
            })
            if (htmlContent) {
              res.setHeader('Content-Type', 'text/html')
              res.end(htmlContent)
              return
            }
          }
          next()
        })
      }
    },
    handleHotUpdate({file, server}: { file: string, server: any }) {
      // 更新时刷新当前页面
      if (file.endsWith('.html')) {
        const {allUrl, isAllUrl} = getPublicHtml(configPublicHtml)
        if (isAllUrl || allUrl.length) {
          const publicPath = path.join(cfgConfig.root, 'public')
          const dirPath = path.relative(publicPath, file)
          server.ws.send({
            type: 'full-reload',
            path: '/' + getTransform(dirPath)
          })
        }
      }
      if (config?.scss?.length && file.endsWith('.scss')) {
        const fileDir: string = getTransform(file)
        config.scss.forEach((item: Scss) => {
          if (fileDir.includes(item.entry)) {
            transformSass(cfgConfig.root, item)
          }
        })
      }
    },
    async closeBundle() {
      // vite build 构建生产环境时才执行
      //console.log('cfgConfig',cfgConfig)
      if (!cfgConfig.isProduction) {
        return
      }
      // 处理public下的html
      const {allUrl, isAllUrl} = getPublicHtml(configPublicHtml)
      if (isAllUrl || allUrl.length) {
        await publicHtml({
          root: cfgConfig.root,
          filePath: isAllUrl || allUrl,
          mode: 'build',
          outDir: cfgConfig.outDir,
          callback: config.callback
        })
      }
      if (!config?.routes?.length) {
        //console.log('路由地址为空，请配置需预渲染的routes')
        return
      }
      console.log('[vite-plugin-seo-prerender:routes] is start..')
      const cProcess = childProcess.exec('vite preview', (err) => {
        if (err) {
          console.error('执行命令时发生错误：', err);
          return;
        }
      })
      let localUrl: string = ''
      // @ts-ignore
      cProcess.stdout.on('data', async (data) => {
        const local = data.match(/http:\/\/(.*?)\//g)
        if (local && local.length && !localUrl) {
          //转义并去掉最后一个/
          localUrl = local[0].replace(/\x1B\[\d+m/g, '').slice(0, -1) // 控制台输出的有些会经过转义
          console.log('Local: ' + localUrl)
          cfgConfig.local = localUrl
          await prerender(Object.assign(cfgConfig,config))
          // 在某个条件满足时，关闭进程退出
          cProcess.kill('SIGTERM')
          process.exit() // 关闭当前进程并退出
          localUrl = ''
        }
      })
    }
  } as Plugin
}

export default seoPrerender

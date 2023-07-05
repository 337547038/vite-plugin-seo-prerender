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
  puppeteer?: any // puppeteer一些配置
  routes?: string[] // 需要生成的路由地址
  removeStyle?: boolean // 启用vite preview会自带有些样式，默认下移除
  callback?: Function
  publicHtml?: boolean | string[] // public目录html文件处理
  scss?: Scss[]
}

const getPublicHtml = (publicHtml) => {
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
    base: ''
  }
  return {
    name: 'vitePluginSeoPrerender',
    enforce: 'post',
    configResolved(cfg: any) {
      cfgConfig.outDir = cfg.build.outDir
      cfgConfig.mode = cfg.mode
      cfgConfig.root = cfg.root
      cfgConfig.base = cfg.base
    },
    buildStart() {
      if (config?.scss?.length) {
        config.scss.forEach((item: Scss) => {
          transformSass(cfgConfig.root, item)
        })
      }
    },
    configureServer(server) {
      const {allUrl, isAllUrl} = getPublicHtml(config?.publicHtml)
      if (allUrl.length || isAllUrl) {
        server.middlewares.use(async (req, res, next) => {
          const baseUrl = req.url.replace(cfgConfig.base, '/')
          if ((isAllUrl && baseUrl.endsWith('.html')) || allUrl.includes(baseUrl)) {
            const htmlContent: string = await publicHtml({
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
    handleHotUpdate({file, server}) {
      // 更新时刷新当前页面
      if (file.endsWith('.html')) {
        const {allUrl, isAllUrl} = getPublicHtml(config?.publicHtml)
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
      if (cfgConfig.mode !== 'production') {
        return
      }
      // 处理public下的html
      const {allUrl, isAllUrl} = getPublicHtml(config?.publicHtml)
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
      let localUrl
      cProcess.stdout.on('data', async (data) => {
        const local = data.match(/http:\/\/(.*?)\//g)
        if (local && local.length && !localUrl) {
          //转义并去掉最后一个/
          localUrl = local[0].replace(/\x1B\[\d+m/g, '').slice(0, -1) // 控制台输出的有些会经过转义
          console.log('Local: ' + localUrl)
          cfgConfig.local = localUrl
          await prerender(Object.assign(config, cfgConfig))
          // 在某个条件满足时，关闭进程退出
          cProcess.kill('SIGTERM')
          process.exit() // 关闭当前进程并退出
          localUrl = ''
        }
      })
    }
  }
}

export default seoPrerender



import childProcess from 'child_process'
import path from 'path'
import seoPrerender from './render'
import publicHtml from "./public"
import {Config} from "./types"
import {createServer} from 'vite';
import fs from 'fs'
import puppeteer from 'puppeteer'


let pPage
const prerender = (config: Config) => {
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
    async buildStart() {

    },
    buildEnd() {
      console.log('buildEnd，没看到有触发')
    },
    async load(id) {
    },
    transform(code, id) {
      /*if (id.endsWith('.html')) {
        console.log('transform:',id)
      }*/
    },
    /*transformIndexHtml(html, tag) {
      //console.log('transform',html)
    },*/
    transformIndexHtml: {
      async transform(html, ctx) {
        console.log('transform')
        //console.log('html',html)
        //console.log('ctx',ctx)
        //ctx.moduleGraph.transformIndexHtml(html=>{})

      }
    },
    async handleHotUpdate({file, server}) {
      if (file.endsWith('.html')) {
        /*console.log('file:',server)
        // 启动一个浏览器服务
        if (!pPage) {
          const browser = await puppeteer.launch(Object.assign({headless: 'new'}, config.puppeteer || {}));
          pPage = await browser.newPage()
          await pPage.goto('http://127.0.0.1:5173')
          await pPage.setViewport({width: 1024, height: 768})
        }
        pPage.content()
          .then(html => {
            console.log('page content', html)
          })
          .catch(res => {
            console.log('catch', res)
          })*/
      }
    },
    configureServer(server) {
      if (config.html?.routes?.length) {
        server.middlewares.use((req, res, next) => {
          //  console.log(server.moduleGraph)
          const baseUrl = req.url.replace(cfgConfig.base, '/')
          console.log('base',baseUrl)
          if (config.html.routes.includes(baseUrl)) {
            console.log(req.url)
            const module = server.moduleGraph.getModuleByUrl(req.url)
              .then(res => {
                console.log(res, 'okk')
              })

            const htmlContent = module ? module.content : '';
            res.setHeader('Content-Type', 'text/html')
            res.end('12');
            return;
          }
          next()
        })
      }
      // console.log('configureServer')
      //const {watcher} = server
      /*if (config.htmlRoutes?.length) {
        watcher.on('change', async (filePath) => {
          const relativePath = path.relative(server.config.root, filePath).replace('public', '').replace(/\\/g, '/')
          if (config.htmlRoutes.includes(relativePath)) {
            // 监听 public 目录下的指定　HTML 文件更改
            let hostPort = '' // 获取启用的服务ip地址端口
            const resolvedUrls = server.resolvedUrls
            for (const key in resolvedUrls) {
              if (resolvedUrls[key].length) {
                hostPort = resolvedUrls[key][0]
              }
            }
            await publicHtml(Object.assign(config,
              {hostPort: hostPort, filePath: filePath}), 'dev')
          }
        })
      }*/
    },
    closeBundle() {
      if (!config?.routes?.length) {
        console.log('路由地址为空，请配置需预渲染的routes')
        return
      }
      // vite build 构建生产环境时才执行
      if (cfgConfig.mode !== 'production') {
        return
      }
      console.log('[vite-plugin-seo-prerender] is start..')
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
          await seoPrerender(Object.assign(config, cfgConfig))
          // 在某个条件满足时，关闭进程退出
          cProcess.kill('SIGTERM')
          process.exit() // 关闭当前进程并退出
          localUrl = ''
        }
      })
    }
  }
}
export default prerender



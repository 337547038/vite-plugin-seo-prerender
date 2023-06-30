import seoPrerender from './render'
import childProcess from 'child_process'
import path from 'path'

interface Config {
  puppeteer?: any // puppeteer一些配置
  routes?: string[] // 需要生成的路由地址
  removeStyle?: boolean // 启用vite preview会自带有些样式，默认下移除
  callback?: Function
  htmlRoutes?: string[] // 处理public目录下的html文件
}

const prerender = (config: Config) => {
  const cfgConfig = {
    outDir: '',
    mode: '',
    root: '',
    local: ''
  }
  return {
    name: 'vitePluginSeoPrerender',
    enforce: 'post',
    configResolved(cfg: any) {
      cfgConfig.outDir = cfg.build.outDir
      cfgConfig.mode = cfg.mode
      cfgConfig.root = cfg.root
    },
    buildEnd() {
      //console.log('buildEnd')
    },
    configureServer(server) {
      console.log('is build')
      const {watcher} = server
      if (config.htmlRoutes?.length) {
        watcher.on('change', (filePath) => {
          const relativePath = path.relative(server.config.root, filePath).replace('public', '').replace(/\\/g,'/')
          if (config.htmlRoutes.includes(relativePath)) {
            // 监听 public 目录下的 HTML 文件更改
            console.log('server',server)
          }
        })
      }
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
      const cProcess = childProcess.exec('vite preview', (err, stdout, stderr) => {
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



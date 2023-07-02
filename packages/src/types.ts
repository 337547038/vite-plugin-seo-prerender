export interface Config {
  puppeteer?: any // puppeteer一些配置
  routes?: string[] // 需要生成的路由地址
  removeStyle?: boolean // 启用vite preview会自带有些样式，默认下移除
  callback?: Function
  html:{ // 处理public目录下的html文件
    routes?: string[]
  }
}

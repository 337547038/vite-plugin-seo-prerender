import fs from 'fs'
import path from 'path'

/**
 * 将\转为/
 * @param string
 */
export const getTransform = (string: string) => {
  if (!string) {
    return string
  }
  return string.replace(/\\/g, '/')
}

/**
 * 递归创建目录
 * @param dirPath
 */
export const recursiveMkdir = (dirPath:string) => {
  const parentDir:string = path.dirname(dirPath) // 获取父级目录路径
  if (!fs.existsSync(parentDir)) {
    recursiveMkdir(parentDir) // 递归创建父级目录
  }

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath) // 创建当前目录
  }
}

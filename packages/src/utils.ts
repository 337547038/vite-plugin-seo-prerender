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

export function concurrency<T, E = T | Error>(taskList: (() => Promise<T>)[], maxDegreeOfParalellism = 5) {
  const total = taskList.length;
  let idx = 0;
  const resut: { index: number; result: T; error: E }[] = [];
  const onFinish = (index: number, result: T, error?: E) => {
    resut.push({ index, result, error: error as never });
    return next();
  };
  const next = (): Promise<void> => {
    if (idx >= total) return Promise.resolve();
    const index = idx++;
    return taskList[index]()
      .then(r => onFinish(index, r))
      .catch(error => onFinish(index, null as never as T, error));
  };
  const size = Math.max(1, Math.min(maxDegreeOfParalellism, total));
  const queue: Promise<void>[] = [];
  for (let i = 0; i < size; i++) queue.push(next());

  return Promise.allSettled(queue).then(() => resut.sort((a, b) => a.index - b.index));
}

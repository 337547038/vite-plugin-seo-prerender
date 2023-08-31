import {createRouter, createWebHashHistory,createWebHistory} from 'vue-router'
// @ts-ignore

const routes = [
  {
    path: '/',
    name: 'index',
    component: () => import('./views/index.vue')
  },
  {
    path: '/about',
    name: '/about',
    component: () => import('./views/about/index.vue'),
    meta: {
      title: '关于我们',
      keywords: '关键词3, 关键词4',
      description: '关于我们描述'
    }
  },
  {
    path: '/test',
    name: '/test',
    component: () => import('./views/test.vue')
  },
  {
    path: '/test1',
    name: '/test1',
    component: () => import('./views/test1.vue'),
    meta: {
      title: 'test1',
      keywords: '关键词3, 关键词4',
      description: '关于我们描述'
    }
  },
  {
    path: '/test2',
    name: '/test2',
    component: () => import('./views/test2.vue'),
    meta: {
      title: 'test2',
      keywords: '关键词3, 关键词4',
      description: '关于我们描述'
    }
  },
  {
    path: '/test3',
    name: '/test3',
    component: () => import('./views/test3.vue'),
    meta: {
      title: 'test3',
      keywords: '关键词3, 关键词4',
      description: '关于我们描述'
    }
  }
]
// console.log(routes)
// 配置路由
const router = createRouter({
 //history: createWebHistory(),
  history: createWebHashHistory(),
  routes: routes
})

router.afterEach((to) => {
  const {title, keywords, description} = to.meta;
  if (title) {
    document.title = title;
  }
  if (keywords) {
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.content = keywords;
    }
  }
  if (description) {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.content = description;
    }
  }
})
export default router

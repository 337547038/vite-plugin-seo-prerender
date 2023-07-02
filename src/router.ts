import {createRouter, createWebHistory} from 'vue-router'
// @ts-ignore

const routes = [
  {
    path: '/',
    name: '/test',
    component: () => import('./views/test.vue')
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
  }
]
// console.log(routes)
// 配置路由
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  //history: createWebHashHistory(),
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

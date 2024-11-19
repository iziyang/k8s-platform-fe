// 导入 router 的路由方法
import {createRouter, createWebHistory} from 'vue-router'
// 导入进度条组件
import NProgress from 'nprogress'
// 导入进度条样式
import 'nprogress/nprogress.css'

const routes = [
    {
        path: '/test',
        component: () => import('@/views/test/Test.vue'),
        meta: {title: 'Test'},
    },
    {
        path: '/login',
        component: () => import('@/views/login/Login.vue'),
        meta: {title: '登录'},
    }
]

// 创建路由
const router = createRouter({
    history: createWebHistory(),
    routes,
})

// 进度条配置
NProgress.inc(100)

NProgress.configure({ // 配置NProgress的参数
    easing: 'ease', // 动画效果
    speed: 600, // 动画速度
    showSpinner: false // 是否显示加载时的旋转图标
})
// 前置路由守卫
router.beforeEach((to, from, next) => {
    NProgress.start() // 进度条开始
    if (to.meta.title) {
        document.title = to.meta.title
    } else {
        document.title = 'K8s 管理平台'
    }
    next()
})

// 后置路由守卫
router.afterEach(() => {
    NProgress.done() // 进度条结束
})

export default router


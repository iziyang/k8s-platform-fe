<template>
    <div>
        <el-container style="height: 100vh">
            <el-aside class="aside" :width="asideWidth" style="background-color: #131b27">
                <el-affix class="aside-affix" :z-index="1200">
                    <div class="aside-logo">
                        <el-image class="logo-image" :src="logo"></el-image>
                        <span :class="[isCollapse ? 'is-collapse' : '']">
                            <span class="logo-name">Kubernetes</span>
                        </span>
                    </div>
                </el-affix>
                <!--                使用 vue-router 模式，将导航栏的 index 和 path 关联后进行路由跳转-->
                <el-menu class="aside-menu" router :default-active="$route.path" :collapse="isCollapse"
                    background-color="#131b27" text-color="#bfcbd9" active-text-color="#20a0ff">
                    <!--                    for 循环路由规则-->
                    <template v-for="menu in routers" :key="menu">
                        <!--                        处理长度为1的情况-->
                        <!--                        index 作为 item 与 path 的匹配-->
                        <el-menu-item class="aside-menu-item" v-if="menu.children && menu.children.length === 1"
                            :index="menu.children[0].path">
                            <!--                            当组件名是个变量就这么写-->
                            <el-icon>
                                <component :is="menu.children[0].icon" />
                            </el-icon>
                            <template #title>
                                {{ menu.children[0].name }}
                            </template>
                        </el-menu-item>
                        <el-sub-menu class="aside-submenu" v-else-if="menu.children && menu.children.length > 1"
                            :index="menu.path">
                            <template #title>
                                <el-icon>
                                    <component :is="menu.icon" />
                                </el-icon>
                                <span>{{ menu.name }}</span>
                            </template>
                            <el-menu-item class="aside-submenu-childitem" v-for="child in menu.children" :key="child"
                                :index="child.path">
                                <template #title>
                                    {{ child.name }}
                                </template>
                            </el-menu-item>
                        </el-sub-menu>
                    </template>
                </el-menu>
            </el-aside>
            <el-container>
                <el-header class="header">
                    <el-row :gutter="20">
                        <el-col :span="1">
                            <!--                            折叠按钮-->
                            <div class="header-collapse" @click="onCollapse">
                                <el-icon>
                                    <component :is="isCollapse ? 'expand':'fold'" />
                                </el-icon>
                            </div>
                        </el-col>
                        <el-col :span="10">
                            <div class="header-breadcrumb">
                                <el-breadcrumb separator="/">
                                    <el-breadcrumb-item :to="{ path: '/' }">Home</el-breadcrumb-item>
                                    <template v-for="(matched, idx) in this.$route.matched" :key="idx">
                                        <el-breadcrumb-item v-if="matched.name">
                                            {{ matched.name }}
                                        </el-breadcrumb-item>
                                    </template>
                                </el-breadcrumb>
                            </div>
                        </el-col>
                        <el-col class="header-menu" :span="13">
                            <el-dropdown>
                                <!-- 用户信息 -->
                                <div class="header-dropdown">
                                    <el-image class="avator-image" :src="avator" />
                                    <span>{{ username }}</span>
                                </div>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item @click="logout()">退出</el-dropdown-item>
                                        <el-dropdown-item>修改密码</el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </el-col>
                    </el-row>
                </el-header>
                <el-main>
                    <router-view />
                </el-main>
                <el-footer class="footer">
                    <el-icon style="width: 2em;top:3px;font-size: 18px;"><place/></el-icon>
                    <a>2023 adoo devops</a>
                </el-footer>
            </el-container>
        </el-container>
    </div>
</template>

<script>
import {useRouter} from "vue-router"
export default ({
    data() {
        return {
            logo: require('@/assets/img/k8s-metrics.png'),
            avator: require('@/assets/img/avator.png'),
            asideWidth: "200px",
            isCollapse: false,
            //路由规则
            routers:[]
        }
    },
    computed: {
        username() {
            let username = localStorage.getItem("username")
            return username?username:"未知"
        }
    },
    methods: {
        onCollapse() {
            this.isCollapse = !this.isCollapse;
            if (this.isCollapse) {
                this.asideWidth = "64px";
            } else {
                this.asideWidth = "200px";
            }
        },
        logout() {
            alert("退出成功")
        }
    },
    mounted() {
        // 获取 routes 中定义的路由规则
        this.routers = useRouter().options.routes
    },
})
</script>
<style scoped>
    .aside {
        transition: width 0.3s;
        background-color: #131b27;
        overflow: hidden;
    }
    .aside-logo {
        height: 60px;
        background-color: #131b27;
        color: white;
        display: flex;
        align-items: center;
        transition: all 0.3s;
    }
    .logo-image {
        width: 40px;
        height: 40px;
        padding-left: 12px;
        flex-shrink: 0;
    }
    .logo-name {
        font-size: 20px;
        font-weight: bold;
        padding: 10px;
        transition: opacity 0.3s;
        white-space: nowrap;
    }
    .is-collapse {
        display: none;
    }
    .aside-menu {
        border-right: 0;
    }
    .aside::-webkit-scrollbar {
        display: none;
    }
    .header {
        z-index: 1200;
        line-height: 60px;
        font-size: 24px;
        box-shadow: 0 2px 4px rgb(0,0,0,.12), 0 0 6px rgb(0,0,0,.04);
    }
    .header-collapse {
        cursor: pointer;
    }
    .header-breadcrumb {
        padding-top: 0.9em;
    }
    .header-menu {
        text-align: right;
    }
    .header-dropdown {
        cursor: pointer;
        line-height: 60px;
    }
    .avator-image {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        top: 12px;
        margin-right: 8px;
    }
    .footer {
        z-index: 1200;
        color: gray;
        font-size: 14px;
        text-align: center;
        line-height: 60px;
    }

</style>
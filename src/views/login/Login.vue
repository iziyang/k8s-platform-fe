<template>
    <div class="login">
        <el-card class="login-card">
            <!--设置卡片头部-->
            <!--通过 header 插槽，插槽最大的特点就是能将 html 以及文档都可以放进去-->
            <template #header>
                <div class="login-card-header">
                    <span>用户登录</span>
                </div>
            </template>
        </el-card>
    </div>
</template>

/* style 中要加 scoped 进行隔离 */
<style scoped>
    .login {
        position: absolute;
        width: 100%;
        height: 100%;
        background-image: url(../../assets/img/login3.webp);
        background-size: 100%;
    }
    .login-card {
        position: absolute;
        left: 40%;
        top: 40%;
        width: 350px;
    }
    .login-card-header {
        /* 我需要把这个用户登录的 header居中*/
        text-align: center;

    }
</style>
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
            <el-form :model="loginData" :rules="loginDataRules" ref="loginData">
                <el-form-item prop="username" label="账号">
                    <el-input
                        prefix-icon="UserFilled"
                        v-model.trim="loginData.username"
                        maxlength="32"
                        placeholder="请输入账号"
                        clearable>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password" label="密码">
                    <el-input
                        prefix-icon="Lock"
                        v-model.trim="loginData.password"
                        maxlength="16"
                        placeholder="请输入密码"
                        clearable
                        show-password>
                    </el-input>
                </el-form-item>
                <el-form-item>
                    <el-button
                        type="primary"
                        style="width: 100%"
                        :loading="loginLoading"
                        @click="handleLogin('loginData')"> 登录
                    </el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script>

export default ({
    data() {
        return {
            loginData: {
                username: "",
                password: "",
            },
            loginDataRules: {
                username: [
                    {required: true, message: "请输入用户名", trigger: "change"},
                ],
                password: [{required: true, message: "请输入密码", trigger: "change"}],
            },
            loginLoading: false,
        }
    },
    methods: {
        handleLogin(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    alert("登录成功")
                    // 调用后端登录接口验证账号密码是否正确
                } else {
                    return false;
                }
            })
        }
    }
})
</script>

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
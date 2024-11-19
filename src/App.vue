<template>
    <router-view></router-view>
</template>

<style>
    html, body {
         /*vw 和 vh 代表的是浏览器的宽和高的百分比*/
        width: 100vw;
        height: 100vh;
        padding: 0;
        margin: 0;
    }
    /*进度条的 css*/
    #nprogress .bar {
        background: #29d !important;
    }
</style>

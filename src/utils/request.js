import axios from 'axios';

//新建axios对象
const httpClient = axios.create({
    //验证合法的响应状态码
    validateStatus(status) {
        return status >= 200 && status <= 504 //弱不合法，则不会接收response
    },
    timeout: 10000 //超时时间10秒
})

httpClient.defaults.retry = 3 //重试3次
httpClient.defaults.retryDelay = 1000 //重试时间间隔为1秒
httpClient.defaults.shouldRetry = true //是否重试

//添加请求拦截器
httpClient.interceptors.request.use(
    config => {
        //添加header
        config.headers['Content-Type'] = 'application/json'
        config.headers['Accept-Language'] = 'zh-CN'
        config.headers['Authorization'] = localStorage.getItem('token') //设置token请求头
        if (config.method == 'post') {
            if (!config.data) { //没有参数时，config.data为null，需要转下类型
                config.data = {}
            }
        }
        return config
    },
    err => {
        Promise.reject(err)
    }
)

//添加响应拦截器
httpClient.interceptors.response.use(
    response => {
        if (response.status !== 200) {
            return Promise.reject(response.data)
        } else {
            return response.data
        }
    },
    err => {
        return Promise.reject(err)
    }
)

//export出去
export default httpClient
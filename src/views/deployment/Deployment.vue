<template>
  <div>
    <el-row>
      <!-- 头部1，放namespace选择框, 刷新按钮 -->
      <el-col :span="24">
        <el-card class="deploy-head-card" shadow="never" :body-style="{ padding: '10px' }">
          <el-row>
            <!-- namespace下拉选择框 -->
            <el-col :span=8>
              <span style="font-size: 14px;">命名空间：</span>
              <el-select @change="npChange" size="small" v-model="namespaceValue" filterable>
                <el-option v-for="(item, index) in namespaceList" :key="index" :label="item.metadata.name"
                  :value="item.metadata.name"></el-option>
              </el-select>
            </el-col>
            <el-col :span="16" style="text-align:right;">
              <el-button size="small" icon="Refresh" plain @click="getDeployments()">刷新</el-button>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
      <!-- 头部2，创建按钮 及搜索框 -->
      <el-col :span="24">
        <el-card class="deploy-head-card" shadow="never" :body-style="{ padding: '10px' }">
          <!-- float属性，会将多个同级标签放在同一行 -->
          <div style="float: left;margin-right:10px;">
            <el-button size="small" type="primary" icon="Edit" @click="createDeploymentDrawer = true">创建</el-button>
          </div>
          <div>
            <el-input class="deploy-head-search" size="small" clearable placeholder="请输入"
              v-model='searchValue'></el-input>
            <el-button size="small" type="primary" plain icon="Edit" @click="getDeployments()">搜索</el-button>
          </div>
        </el-card>
      </el-col>
      <!-- 数据表格 -->
      <el-col :span="24">
        <el-card class="deploy-body-card" shadow="never" :body-style="{ padding: '10px' }">
          <el-table style="font-size:12px;" :data="deploymentList" v-loading="appLoading">
            <!-- v-loading用于加载时的laoding动画 -->
            <!-- 表格内容 -->
            <!-- 最左侧留出20培训的宽度 -->
            <el-table-column width="20"></el-table-column>
            <!-- deployment名字 -->
            <el-table-column label="Deployment名" prop="metadata.name">
              <!-- 插槽，scope.row获取当前行的数据 -->
              <template v-slot="scope">
                <a class="deploy-body-deployname">{{ scope.row.metadata.name }}</a>
              </template>
            </el-table-column>
            <!-- 标签 -->
            <el-table-column label="标签">
              <template v-slot="scope">
                <div v-for="(val, key) in scope.row.metadata.labels" :key="key">
                  <!-- 气泡弹出框 -->
                  <el-popover placement="right" :width="200" trigger="hover" :content="key + ':' + val">
                    <template #reference>
                      <el-tag type="warning" style="margin-bottom:5px;">
                        {{ ellipsis(key + ':' + val) }}
                      </el-tag>
                    </template>
                  </el-popover>
                </div>
              </template>
            </el-table-column>
            <!-- 容器组 -->
            <el-table-column label="容器组">
              <template v-slot="scope">
                <span>{{ scope.row.status.availableReplicas > 0 ? scope.row.status.availableReplicas : 0 }}/ {{
                  scope.row.spec.replicas > 0 ? scope.row.spec.replicas : 0 }}</span>
              </template>
            </el-table-column>
            <!-- 创建时间 -->
            <el-table-column label="创建时间">
              <template v-slot="scope">
                <el-tag type="info">{{ timeTrans(scope.row.metadata.creationTimestamp) }}</el-tag>
              </template>
            </el-table-column>
            <!-- 容器镜像 -->
            <el-table-column label="容器镜像">
              <template v-slot="scope">
                <div v-for="(val, key) in scope.row.spec.template.spec.containers" :key="key">
                  <!-- 气泡弹出框 -->
                  <el-popover placement="right" :width="200" trigger="hover" :content="val.image">
                    <template #reference>
                      <el-tag style="margin-bottom:5px;">
                        {{ ellipsis(val.image.split('/')[2] == undefined ? val.image : val.image.split('/')[2]) }}
                      </el-tag>
                    </template>
                  </el-popover>
                </div>
              </template>
            </el-table-column>
            <!-- 操作列,放按钮 -->
            <el-table-column label="操作" fixed="right" width="350">
              <template v-slot="scope">
                <el-button size="small" icon="Edit" type="primary" plain
                  @click="getDeploymentDetail(scope)">YAML</el-button>
                <el-button size="small" icon="Edit" type="primary" @click="handleScale(scope)">扩缩</el-button>
                <el-button size="small" icon="Edit" type="primary"
                  @click="handleConfirm(scope, '重启', restartDeployment)">重启</el-button>
                <el-button size="small" icon="Edit" type="danger" plain
                  @click="handleConfirm(scope, '删除', delDeployment)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- 分页配置 -->
          <!-- background 背景色灰 -->
          <!-- size-change 单页大小改变后触发 -->
          <!-- current-change 页数改变后触发 -->
          <!-- current-page 当前页 -->
          <!-- page-size 单页大小 -->
          <!-- layout 分页器支持的功能 -->
          <!-- total 数据总条数 -->
          <el-pagination style="margin-top:10px;" background @size-change="handleSizeChange"
            @current-change="handleCurrentChange" :current-page="currentPage" :page-sizes="pagesizeList"
            :page-size="pagesize" layout="total, sizes, prev, pager, next, jumper" :total="deploymentTotal">
          </el-pagination>
        </el-card>
      </el-col>
    </el-row>
    <!-- 创建 -->
    <el-drawer v-model="createDeploymentDrawer" direction="rtl" :before-close="handleClose" title="创建Deployment">
      <template #default>
        <!-- flex布局,居中 -->
        <el-row type="flex" justify="center">
          <el-col :span="20">
            <!-- ref绑定控件后，js中才能用this.$ref获取该控件 -->
            <!-- rules 定义form表单校验规则 -->
            <el-form ref="createDeployment" :rules="createDeploymentRules" :model="createDeployment" label-width="80px">
              <!-- prop用于rules中的校验规则的key -->
              <el-form-item class="deploy-create-form" label="名称" prop="name">
                <el-input v-model="createDeployment.name"></el-input>
              </el-form-item>
              <el-form-item class="deploy-create-form" label="命名空间" prop="namespace">
                <el-select v-model="createDeployment.namespace" filterable placeholder="请选择">
                  <el-option v-for="(item, index) in namespaceList" :key="index" :label="item.metadata.name"
                    :value="item.metadata.name">
                  </el-option>
                </el-select>
              </el-form-item>
              <!-- 数字输入框，最小为1，最大为10 -->
              <el-form-item class="deploy-create-form" label="副本数" prop="replicas">
                <el-input-number v-model="createDeployment.replicas" :min="1" :max="10"></el-input-number>
                <!-- 气泡弹出框用于提醒上限 -->
                <el-popover placement="top" :width="100" trigger="hover" content="申请副本数上限为10个">
                  <template #reference>
                    <el-icon style="width:2em;font-size:18px;color:#4795EE">
                      <WarningFilled />
                    </el-icon>
                  </template>
                </el-popover>
              </el-form-item>
              <el-form-item class="deploy-create-form" label="镜像" prop="image">
                <el-input v-model="createDeployment.image"></el-input>
              </el-form-item>
              <el-form-item class="deploy-create-form" label="标签" prop="label_str">
                <el-input v-model="createDeployment.label_str" placeholder="示例: project=ms,app=gateway"></el-input>
              </el-form-item>
              <!-- 下拉框，用于规格的选择，之后用/分割，得到cpu和内存 -->
              <el-form-item class="deploy-create-form" label="资源配额" prop="resource">
                <el-select v-model="createDeployment.resource" placeholder="请选择">
                  <el-option value="0.5/1" label="0.5C1G"></el-option>
                  <el-option value="1/2" label="1C2G"></el-option>
                  <el-option value="2/4" label="2C4G"></el-option>
                  <el-option value="4/8" label="4C8G"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item class="deploy-create-form" label="容器端口" prop="container_port">
                <el-input v-model="createDeployment.container_port" placeholder="示例: 80"></el-input>
              </el-form-item>
              <el-form-item class="deploy-create-form" label="健康检查" prop="health">
                <el-switch v-model="createDeployment.health_check" />
              </el-form-item>
              <el-form-item class="deploy-create-form" label="检查路径" prop="healthPath">
                <el-input v-model="createDeployment.health_path" placeholder="示例: /health"></el-input>
              </el-form-item>
            </el-form>
          </el-col>
        </el-row>
      </template>
      <!-- 插槽，抽屉footer -->
      <template #footer>
        <!-- 点击后赋值false，隐藏抽屉 -->
        <el-button @click="createDeploymentDrawer = false">取消</el-button>
        <el-button type="primary" @click="submitForm('createDeployment')">立即创建</el-button>
      </template>
    </el-drawer>
    <!-- yaml编辑器 -->
    <el-dialog title="YAML信息" v-model="yamlDialog" width="45%" top="2%">
      <codemirror :value="contentYaml" border :options="cmOptions" height="500" style="font-size:14px;"
        @change="onChange">
      </codemirror>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="yamlDialog = false">取 消</el-button>
          <el-button type="primary" @click="updateDeployment()">更 新</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 扩缩 -->
    <el-dialog title="调整副本数" v-model="scaleDialog" width="25%">
      <div style="text-align:center">
        <span>副本数：</span>
        <el-input-number v-model="scaleNum" :min="0" :max="30"></el-input-number>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="scaleDialog = false">取 消</el-button>
          <el-button type="primary" @click="scaleDeployment()">更 新</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import common from '../common/Config'
import httpClient from '@/request'
import yaml2obj from 'js-yaml'
import json2yaml from 'json2yaml'
export default ({
  data() {
    return {
      namespaceValue: 'default',
      namespaceListUrl: common.k8sNamespaceList,
      namespaceList: [],
      createDeploymentDrawer: false,
      searchValue: '',
      appLoading: false,
      //分页
      currentPage: 1,
      pagesize: 10,
      pagesizeList: [10, 20, 30],
      //创建
      createDeployment: {
        name: '',
        namespace: '',
        replicas: 1,
        image: '',
        resource: '',
        health_check: false,
        health_path: '',
        label_str: '',
        label: {},
        container_port: ''
      },
      createDeploymentData: {
        url: common.k8sDeploymentCreate,
        params: {}
      },
      //创建deployment的表单校验规则
      createDeploymentRules: {
        name: [{
          required: true,
          message: '请填写名称',
          trigger: 'change'
        }],
        image: [{
          required: true,
          message: '请填写镜像',
          trigger: 'change'
        }],
        namespace: [{
          required: true,
          message: '请选择命名空间',
          trigger: 'change'
        }],
        resource: [{
          required: true,
          message: '请选择配额',
          trigger: 'change'
        }],
        label_str: [{
          required: true,
          message: '请填写标签',
          trigger: 'change'
        }],
        container_port: [{
          required: true,
          message: '请填写容器端口',
          trigger: 'change'
        }],
      },
      //列表
      deploymentList: [],
      deploymentTotal: 0,
      deploymentListData: {
        url: common.k8sDeploymentList,
        params: {
          filter_name: '',
          namespace: '',
          page: 1,
          limit: 10
        }
      },
      //详情
      deploymentDetail: '',
      deploymentDetailData: {
        url: common.k8sDeploymentDetail,
        params: {
          deployment_name: '',
          namespace: ''
        }
      },
      //codemirror
      yamlDialog: false,
      contentYaml: '',
      cmOptions: common.cmOptions,
      //更新
      updateDeploymentData: {
        url: common.k8sDeploymentUpdate,
        params: {
          content: '',
          namespace: ''
        }
      },
      //扩缩
      scaleNum: 0,
      scaleDialog: false,
      scaleDeploymentData: {
        url: common.k8sDeploymentScale,
        params: {
          deployment_name: '',
          scale_num: 0,
          namespace: ''
        }
      },
      //重启
      restartDeploymentData: {
        url: common.k8sDeploymentRestart,
        params: {
          deployment_name: '',
          namespace: ''
        }
      },
      //删除
      delDeploymentData: {
        url: common.k8sDeploymentDel,
        params: {
          deployment_name: '',
          namespace: ''
        }
      }
    }
  },
  methods: {
    //json转yaml方法
    transYaml(content) {
      return json2yaml.stringify(content)
    },
    //yaml转obj方法
    transObj(content) {
      return yaml2obj.load(content)
    },
    onChange(val) {
      this.contentYaml = val
    },
    handleClose() {
      this.createDeploymentDrawer = false
    },
    //页面大小发生变化时触发，赋值并重新获取列表
    handleSizeChange(size) {
      this.pagesize = size;
      this.getDeployments()
    },
    //页数发生变化时触发，复制并重新获取列表
    handleCurrentChange(currentPage) {
      this.currentPage = currentPage;
      this.getDeployments()
    },
    // 格林威治时间转为北京时间
    timeTrans(timestamp) {
      let date = new Date(new Date(timestamp).getTime() + 8 * 3600 * 1000)
      date = date.toJSON()
      date = date.substring(0, 19).replace('T', ' ')
      return date
    },
    ellipsis(value) {
      return value.length > 15 ? value.substring(0, 15) + '...' : value
    },
    getDeployments() {
      //打开loading
      this.appLoading = true
      //定义参数
      this.deploymentListData.params.filter_name = this.searchValue
      this.deploymentListData.params.namespace = this.namespaceValue
      this.deploymentListData.params.page = this.currentPage
      this.deploymentListData.params.limit = this.pagesize
      //发起请求
      httpClient.get(this.deploymentListData.url, { params: this.deploymentListData.params })
        //处理结果
        .then(res => {
          //列表页两个要素
          //数据列表
          //total总数，用于分页
          this.deploymentList = res.data.items
          this.deploymentTotal = res.data.total
        })
        .catch(res => {
          this.$message.error({
            message: res.msg
          })
        })
        .finally(() => {
          this.appLoading = false
        })
    },
    getDeploymentDetail(e) {
      //打开loading
      this.appLoading = true
      //定义参数
      this.deploymentDetailData.params.deployment_name = e.row.metadata.name
      this.deploymentDetailData.params.namespace = this.namespaceValue
      //发起请求
      httpClient.get(this.deploymentDetailData.url, { params: this.deploymentDetailData.params })
        //处理结果
        .then(res => {
          this.deploymentDetail = res.data
          //转yaml
          this.contentYaml = this.transYaml(this.deploymentDetail)
          //打开编辑器
          this.yamlDialog = true
        })
        .catch(res => {
          this.$message.error({
            message: res.msg
          })
        })
        .finally(() => {
          this.appLoading = false
        })
    },
    updateDeployment() {
      this.appLoading = true
      //yaml转json
      let content = JSON.stringify(this.transObj(this.contentYaml))
      //发起请求
      this.updateDeploymentData.params.content = content
      this.updateDeploymentData.params.namespace = this.namespaceValue
      httpClient.put(this.updateDeploymentData.url, this.updateDeploymentData.params)
        .then(res => {
          this.$message.success({
            message: res.msg
          })
        })
        .catch(res => {
          this.$message.error({
            message: res.msg
          })
        })
        .finally(() => {
          this.getDeployments()
          this.yamlDialog = false
          this.appLoading = false
        })
    },
    handleScale(e) {
      this.scaleDialog = true
      this.deploymentDetail = e.row
      this.scaleNum = this.deploymentDetail.spec.replicas
    },
    scaleDeployment() {
      this.appLoading = true
      //发起请求
      this.scaleDeploymentData.params.deployment_name = this.deploymentDetail.metadata.name
      this.scaleDeploymentData.params.scale_num = this.scaleNum
      this.scaleDeploymentData.params.namespace = this.namespaceValue
      httpClient.put(this.scaleDeploymentData.url, this.scaleDeploymentData.params)
        .then(res => {
          this.$message.success({
            message: res.msg
          })
        })
        .catch(res => {
          this.$message.error({
            message: res.msg
          })
        })
        .finally(() => {
          this.getDeployments()
          this.scaleDialog = false
          this.appLoading = false
        })
    },
    restartDeployment(e) {
      this.appLoading = true
      //发起请求
      this.restartDeploymentData.params.deployment_name = e.row.metadata.name
      this.restartDeploymentData.params.namespace = this.namespaceValue
      httpClient.put(this.restartDeploymentData.url, this.restartDeploymentData.params)
        .then(res => {
          this.$message.success({
            message: res.msg
          })
        })
        .catch(res => {
          this.$message.error({
            message: res.msg
          })
        })
        .finally(() => {
          this.getDeployments()
          this.appLoading = false
        })
    },
    delDeployment(e) {
      this.appLoading = true
      //发起请求
      this.delDeploymentData.params.deployment_name = e.row.metadata.name
      this.delDeploymentData.params.namespace = this.namespaceValue
      httpClient.delete(this.delDeploymentData.url, { data: this.delDeploymentData.params })
        .then(res => {
          this.$message.success({
            message: res.msg
          })
        })
        .catch(res => {
          this.$message.error({
            message: res.msg
          })
        })
        .finally(() => {
          this.getDeployments()
          this.appLoading = false
        })
    },
    //确认框
    handleConfirm(obj, operateName, fn) {
      let confirmContent = '确认继续' + operateName + "操作吗？"
      //弹出框用法
      this.$confirm(confirmContent, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        //点击确定的处理方法
        .then(() => {
          fn(obj)
        })
        .catch(() => {
          this.$message.info({
            message: '已取消操作'
          })
        })
    },
    //创建
    createDeploymentFunc() {
      //验证标签合法性
      let reg = new RegExp("(^[A-Za-z]+=[A-Za-z0-9]+).*")
      if (!reg.test(this.createDeployment.label_str)) {
        this.$message.warning({
          message: "标签验证不通过，请重新填写"
        })
        return
      }
      //处理标签和规格
      this.appLoading = true
      let label = new Map()
      let cpu, memory
      let a = (this.createDeployment.label_str).split(",")
      a.forEach(item => {
        let b = item.split("=")
        label[b[0]] = b[1]
      })
      let resourceList = this.createDeployment.resource.split("/")
      cpu = resourceList[0]
      memory = resourceList[1] + "Gi"
      //赋值
      this.createDeploymentData.params = this.createDeployment
      this.createDeploymentData.params.container_port = parseInt(this.createDeployment.container_port)
      this.createDeploymentData.params.label = label
      this.createDeploymentData.params.cpu = cpu
      this.createDeploymentData.params.memory = memory
      httpClient.post(this.createDeploymentData.url, this.createDeploymentData.params)
        .then(res => {
          this.$message.success({
            message: res.msg
          })
          this.resetForm('createDeployment')
        })
        .catch(res => {
          this.$message.error({
            message: res.msg
          })
        })
        .finally(() => {
          this.getDeployments()
          this.createDeploymentDrawer = false
          this.appLoading = false
        })
    },
    //提交表单，验证数据
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.createDeploymentFunc()
        } else {
          return false
        }
      })
    },
    //重置表单
    resetForm(formName) {
      this.$refs[formName].resetFields()
    },
    getNamespaces() {
      httpClient.get(this.namespaceListUrl)
        .then(res => {
          this.namespaceList = res.data.items
        })
        .catch(res => {
          this.$message.error({
            message: res.msg
          })
        })
    },
    npChange() {
      this.getDeployments()
      localStorage.setItem('namespace', this.namespaceValue)
    }
  },
  // watch: {
  //     namespaceValue() {
  //         this.getDeployments()
  //     }
  // },
  //mounted声明周期的操作，用于在页面加载完成之前获取某些数据
  mounted() {
    if (localStorage.getItem('namespace')) {
      this.namespaceValue = localStorage.getItem('namespace')
    }
    this.getNamespaces()
    this.getDeployments()
  }
})
</script>

<style scoped>
/* 卡片样式 */
.deploy-head-card,
.deploy-body-card {
  border-radius: 1px;
  margin-bottom: 5px;
}

.el-button {
  border-radius: 2px;
}

.deploy-head-search {
  width: 160px;
  margin-right: 10px;
}

.deploy-body-deployname {
  font-weight: bold;
  color: rgb(33, 82, 155);
}
</style>

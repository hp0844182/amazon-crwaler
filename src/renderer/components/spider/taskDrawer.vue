<template>
  <div>
    <a-drawer
      width="500"
      placement="right"
      :closable="false"
      @close="onClose"
      :visible="visible"
    >
      <h2
        :v-slot=title
        class="title"
      ><span>采集任务</span>
        <a-tooltip
          placement="topLeft"
          title="刷新任务"
        >

          <a-button
            shape="circle"
            icon="redo"
            @click="refreshData"
          />

        </a-tooltip>
        <a-tooltip
          placement="topLeft"
          title="新增任务"
        >

          <a-button
            shape="circle"
            icon="plus"
            @click="setShowAdd"
          />

        </a-tooltip>
      </h2>
      <a-divider />
      <div class="task_list">
        <a-list
          itemLayout="horizontal"
          :dataSource="data"
        >
          <a-list-item
            slot="renderItem"
            slot-scope="item, index"
          >
            <a-list-item-meta>
              <h3 slot="title">{{item.taskname}}</h3>

            </a-list-item-meta>
            <span>{{getStatus(item.status).text}}</span>
            <a-badge :status="getStatus(item.status).status" />
            <a-dropdown-button @click="()=>{handleButtonClick(item)}">
              开始采集
              <a-menu
                slot="overlay"
                @click="(key)=>{
                
                handleMenuClick(key,item)
              }"
              >
                <a-menu-item key="1">
                  <a-icon type="snippets" />查看任务详情</a-menu-item>
               <a-menu-item key="3">
                  <a-icon type="snippets" />查看数据</a-menu-item>
               
                <a-menu-item key="2">
                  <a-icon type="delete" />删除</a-menu-item>
                 </a-menu>
                 
            </a-dropdown-button>
          </a-list-item>
        </a-list>
      </div>
      <div
        class="setting-drawer-index-handle"
        @click="toggle"
      >
        <a-icon
          type="setting"
          v-if="!visible"
        />
        <a-icon
          type="close"
          v-else
        />
      </div>
    </a-drawer>
    <!-- 添加爬虫任务start -->
    <a-modal
      title="添加任务"
      :visible="showAdd"
      @ok="saveTask"
      okText="确定"
      cancelText="取消"
      :confirmLoading="confirmLoading"
      @cancel="handleCancel"
      destroyOnClose
    >
      <a-form
        :form="form"
        @submit="handleSubmit"
      >
        <a-form-item
          v-for="item in formList"
          :label="item.label"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 12 }"
        >
          <a-input
            v-if="item.type=='text'"
            v-decorator="[
           item.field,
          {rules: [{ required: true, message: '请输入'+item.label }]}
        ]"
            :placeholder="item.placeholder"
          />
          <a-select
            v-if="item.type=='select'"
            v-decorator="[
           item.field,
          {rules: [{ required: true, message: '请选择'+item.label }]}
        ]"
            :placeholder="item.placeholder"
            @change="(val)=>{handleSelectChange(val,item.dict)}"
          >
            <a-select-option
              v-for="dict in getDicts(item.dict)"
              :value="dict.key"
            >
              {{dict.label}}
            </a-select-option>

          </a-select>
        </a-form-item>

      </a-form>
    </a-modal>
    <!-- 添加爬虫任务end-->
  </div>
</template>

<script>
import { formList, country, crawlerType, DICTENUM } from "./config";
import _ from "lodash";
import { ipcRenderer, inAppPurchase } from "electron";
import { clearTimeout } from "timers";

export default {
  data() {
    return {
      title: "",
      visible: true,
      showAdd: false,
      data: [],
      formList,
      formLayout: "horizontal",
      form: this.$form.createForm(this),
      confirmLoading: false,
      status: "Processing",
      buttonTimer: null
    };
  },

  mounted() {
    ipcRenderer.on("addTaskSuc", (e, data) => {
      console.log(data);
    });
    // 返回task数据
    ipcRenderer.on("getTaskSuc", (e, data) => {
      if (data.code == 0) {
        this.data = data.data || [];
        console.log(data.data);
      }
    });
    //监听请求返回
    ipcRenderer.on("backToWeb", (e, data) => {
      switch (data.task) {
        case DICTENUM.DELTASK:
          // 删除回调
          data.code === 0 ? this.getTask() : this.$message.error(data.msg);
          break;
        case DICTENUM.ADDTASK:
          // 添加回调
          if (data.code === 0) {
            this.$message.success("添加成功！");
            this.showAdd = false;
            this.getTask();
          } else {
            this.$message.error(data.msg);
          }
        // 一任务爬取完成
        case DICTENUM.FINISHTASK:
          this.getTask();
        default:
          break;
      }
    });
    // 查询任务
    this.getTask();
  },
  methods: {
    //刷新任务
    refreshData() {
      this.getTask();
    },
    // 查询当前任务
    getTask() {
      ipcRenderer.send("getTast", {});
    },
    onClose() {
      this.visible = false;
    },
    toggle() {
      this.visible = !this.visible;
    },
    // 获取字典数组
    getDicts(type) {
      switch (type) {
        case DICTENUM.COUNTRY:
          return country;
        case DICTENUM.CRAWLERTYPE:
          return crawlerType;
        default:
          return [];
      }
    },
    // 获取状态
    getStatus(status) {
      switch (status) {
        case "1":
          return { text: "新建", status: "default" };
          break;
        case "2":
          return { text: "进行中", status: "processing" };
        case "3":
          return { text: "完成", status: "success" };
        case "4":
          return { text: "运出错行", status: "error" };
        default:
          return { text: "新建", status: "default" };
          break;
      }
    },
    handleButtonClick(item) {
      if (item.status == DICTENUM.PROCECING) {
        return this.$message.info("该任务正在爬取中！");
      }
      if (item.status == DICTENUM.FINISH) {
        return this.$message.info("该任务已完成！");
      }
      clearTimeout(this.buttonTimer);
      this.buttonTimer = setTimeout(() => {
        ipcRenderer.send("goSpider", item);
        setTimeout(() => {
          this.getTask();
        }, 500);
      }, 500);
      console.log(item);
      //this.showAdd = true;
    },
    handleMenuClick(key, item) {
      switch (key.key) {
        // 删除当前任务
        case "2":
          return ipcRenderer.send(DICTENUM.DELTASK, item.id);
        case "1":
          this.$Modal.success({
            title: "任务详情",
            width: 600,
            // JSX support
            content: (
              <a-form>
                <a-form-item
                  label="任务名"
                  label-col={{ span: 3 }}
                  wrapper-col={{ span: 10 }}
                >
                  <a-input value={item.taskname} disabled />
                </a-form-item>
                <a-form-item
                  label="任务类型"
                  label-col={{ span: 3 }}
                  wrapper-col={{ span: 10 }}
                >
                  <a-input
                    value={this.getCrawlerType(item.type).label}
                    disabled
                  />
                </a-form-item>
                <a-form-item
                  label="国家"
                  label-col={{ span: 3 }}
                  wrapper-col={{ span: 10 }}
                >
                  <a-input
                    value={this.getCrawlerType(item.type).label}
                    disabled
                  />
                </a-form-item>
                <a-form-item
                  label="地址"
                  label-col={{ span: 3 }}
                  wrapper-col={{ span: 10 }}
                >
                  <a-input value={item.url} disabled />
                </a-form-item>
                <a-form-item
                  label="关键字"
                  label-col={{ span: 3 }}
                  wrapper-col={{ span: 10 }}
                >
                  <a-input value={item.keywords} disabled />
                </a-form-item>
                <a-form-item
                  label="asins"
                  label-col={{ span: 3 }}
                  wrapper-col={{ span: 10 }}
                >
                  <a-input value={item.asins} disabled />
                </a-form-item>
                <a-form-item
                  label="创建时间"
                  label-col={{ span: 3 }}
                  wrapper-col={{ span: 10 }}
                >
                  <a-input value={item.created_at} disabled />
                </a-form-item>
                <a-form-item
                  label="更新时间"
                  label-col={{ span: 3 }}
                  wrapper-col={{ span: 10 }}
                >
                  <a-input value={item.updated_at} disabled />
                </a-form-item>
              </a-form>
            )
          });
          break;
        case '3':
            this.$parent.handleTaskChange(item)
        default:
          break;
      }
    },
    //删除任务
    deleteTask(item) {
      console.log(item);
    },
    // 添加任务
    saveTask() {
      this.form.validateFields((errors, values) => {
        if (errors) {
          return;
        }
        if (!_.trim(values.taskname)) {
          return this.$message.error("任务名不能为空！");
        }
        if (DICTENUM.KEYWORDS === values.type && !_.trim(values.keywords)) {
          return this.$message.error("关键字不能为空！");
        }
        if (DICTENUM.SHOP === values.type && !_.trim(values.url)) {
          return this.$message.error("商铺地址不能为空！");
        }
        if (DICTENUM.ASIN === values.type && !_.trim(values.asins)) {
          return this.$message.error("asin不能为空！");
        }
        // 向主进程请求添加爬虫任务
        ipcRenderer.send(DICTENUM.ADDTASK, values);
      });
      //this.showAdd = false;
    },
    handleCancel() {
      this.showAdd = false;
    },
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          console.log("Received values of form: ", values);
        }
      });
    },
    //根据值获取采集类型
    getCrawlerType(type) {
      return crawlerType.find(item => {
        return item.key == type;
      });
    },
    // 显示增加任务模态框
    setShowAdd() {
      this.showAdd = true;
    },
    handleSelectChange(val, type) {
      if (type === DICTENUM.CRAWLERTYPE) {
        switch (val) {
          //关键字
          case DICTENUM.KEYWORDS: {
            const newFileds = [
              {
                field: "keywords", //关键字
                label: "关键字",
                placeholder: "请输入关键字",
                type: "text", // 空间类型
                required: true //是否必须
              }
            ];
            this.formList = formList.concat(newFileds);
            break;
          }
          // 根据asin
          case DICTENUM.ASIN: {
            const newFileds = [
              {
                field: "asins", //asins
                label: "asins",
                type: "text", // 空间类型
                placeholder: "输入asins,多个空格分开",
                required: true //是否必须
              }
            ];
            this.formList = formList.concat(newFileds);
            break;
          }
          // 根据商铺地址
          case DICTENUM.SHOP: {
            const newFileds = [
              {
                field: "url", //爬去地址
                label: "商铺地址",
                placeholder: "请输入商铺地址",
                type: "text", // 控件类型
                required: true //是否必须
              }
            ];
            this.formList = formList.concat(newFileds);
            break;
          }
          default:
            break;
        }
      }
    }
  }
};
</script>

<style lang="scss" >
.setting-drawer-index-handle {
  position: absolute;
  top: 240px;
  background: #1890ff;
  width: 48px;
  height: 48px;
  right: 500px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  pointer-events: auto;
  z-index: 1001;
  text-align: center;
  font-size: 16px;
  border-radius: 4px 0 0 4px;

  i {
    color: rgb(255, 255, 255);
    font-size: 20px;
  }
}
.title {
  display: flex;
  justify-content: space-between;
}
.ant-list-item-content {
  justify-content: space-around;
  align-items: center;
}
.task_list {
  max-height: calc(100vh - 130px);
  overflow-y: scroll;
}

.ant-row.ant-form-item {
  // display: flex;
  // justify-content:flex-start;
}
</style>

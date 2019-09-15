<style lang="scss">
.data-container {
  margin: 20px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  .put-form {
    padding: 10px;
    border-bottom: 1px solid rgba($color: #000000, $alpha: 0.1);
  }
  .dddd {
    position: absolute;
    right: 0;
  }
  .ant-table-tbody > tr > td {
    word-wrap: break-word;
    table-layout: fixed;
    word-break: break-all;
  }
}
</style>
<template>
  <div
    class=""
    id=""
  >
    <Header />
    <TaskDrawer />
    <div class="data-container">

      <a-form
        class="put-form"
        layout="inline"
        :form="form"
        @submit="handleSubmit"
      >

        <a-form-item>
          <a-button
            type="primary"
            :loading="isExport"
            @click="exportData"
          >
            导出数据
          </a-button>
        </a-form-item>
      </a-form>
      <a-table
        bordered
         :rowKey="record => record.id"
        size="small"
        :pagination="pagination"
        :scroll="{ x: 1200,y:tableHeight }"
        :columns="columns"
        :dataSource="data"
        @change="handleChange"
      />
    </div>

  </div>
</template>
<script>
import { constants } from "fs";
import { ipcRenderer, app, remote, shell } from "electron";
import reqwest from "reqwest";
import Header from "./header";
import TaskDrawer from "./taskDrawer";
import moment from 'moment'
import { DICTENUM, xslColunms, getCountry } from "./config";
import fs from 'fs-extra'
import Excel from "exceljs";
const columns = [
  {
    title: "产品名",
    dataIndex: "title",
    sorter: true,
    // fixed: 'left',
    width: 150
    // scopedSlots: { customRender: "name" }
  },
  {
    title: "asin",
    dataIndex: "asin",
    // filters: [
    //   { text: "Male", value: "male" },
    //   { text: "Female", value: "female" }
    // ],
    width: 100
  },
  {
    title: "关键字",
    dataIndex: "keyword",
    width: 100
  },
  {
    title: "国家",
    dataIndex: "country",
    width: 100
  },
  {
    title: "货币",
    dataIndex: "currency",
    width: 100
  },
  {
    title: "价格(带符号)",
    dataIndex: "price",
    width: 100
  },
  {
    title: "价格",
    dataIndex: "priceParsed",
    width: 100
  },
  {
    title: "商家",
    dataIndex: "sellerName",
    width: 100
  },
  {
    title: "是否prime",
    dataIndex: "prime",
    width: 100
  },
  {
    title: "状态",
    dataIndex: "condition",
    width: 100
  },
  {
    title: "产品详情地址",
    dataIndex: "detailUrl",
    width: 100
  },
  {
    title: "产品list地址",
    dataIndex: "sellerUrl",
    //  fixed: 'right',
    width: 100
  }
];

function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}
export default {
  data() {
    return {
      columns,
      loading: false,
      data: [],
      form: this.$form.createForm(this),
      hasErrors,
      productTypes: [],
      hasData: false,
      isExport: false,
      page: 0,
      pageSize: 10,
      total: 0,
      tableHeight: 800,
      taskid: null,
      userDataPath: "",
      exportPath: ""
    };
  },
  computed: {
    pagination: function() {
      return {
        current: this.page + 1,
        pageSize: this.pageSize,
        total: this.total
      };
    }
  },
  mounted() {
    // 获取路径
    this.getUserDataPath();
    // 设置表格高度
    this.tableHeight = document.body.offsetHeight - 200;
    window.onresize = function() {
      this.tableHeight = document.body.offsetHeight - 200;
    };
    const that = this;
    // 数据返回
    ipcRenderer.on("productList", (e, data) => {
      this.hasData = true;
      this.loading = false;
      this.data = data.items || [];
      console.log(data);
      // 获取产品类型
      // this.productTypes = data || [];
    });
    // 数据重置成功
    ipcRenderer.on("resetSuccess", (e, data) => {
      this.loading = false;
      this.hasData = false;
      this.data = [];
      this.$message.success("数据重置成功！");
      // 获取产品类型
      // this.productTypes = data || [];
    });
    //监听请求返回
    ipcRenderer.on("backToWeb", (e, data) => {
      switch (data.task) {
        case DICTENUM.GETPRODUCTS:
          this.data = data.data || [];
          this.total = data.totalNum;
          break;
        case DICTENUM.EXPORTDATA:
          this.exportLocalFile(data.data||[]);
          break;
        default:
          break;
      }
    });
  },
  methods: {
    getUserDataPath() {
      const APP = process.type === "renderer" ? remote.app : app;
      this.userDataPath = APP.getPath("userData");
      this.exportPath = this.userDataPath + "/export";
    },
    //监听子组件更改task
    handleTaskChange(task) {
      this.taskid = task.id;
      this.getProducts(this.taskid);
    },

    // 获取该任务下的product
    getProducts(id) {
      console.log({ id, page: this.page, pageSize: this.pageSize });
      ipcRenderer.send("getProducts", {
        id,
        page: this.page,
        pageSize: this.pageSize
      });
    },
    handleChange(pagination, filters, sorter) {
      this.page = pagination.current - 1;
      this.getProducts(this.taskid);
      // const pager = { ...this.pagination };
      // pager.current = pagination.current;
      // this.pagination = pager;
      // this.fetch({
      //   results: pagination.pageSize,
      //   page: pagination.current,
      //   sortField: sorter.field,
      //   sortOrder: sorter.order,
      //   ...filters
      // });
    },
    // 向主进程请求要导出的数据
    exportData() {
      if (!this.taskid) return;
      this.isExport = true;
      ipcRenderer.send("exportData", { id: this.taskid });
    },
    // 导出数据
    exportLocalFile(data) {
      const exportData = data.map(item => {
        return {
          ...item,
          country: getCountry(item.country),
          prime: item.prime == 1 ? "是" : "否"
        };
      });
      // 创建一个文件
      const workbook = new Excel.Workbook();
      workbook.creator = "Me";
      workbook.lastModifiedBy = "Her";
      workbook.created = new Date();
      workbook.modified = new Date();
      // 创建一个工作组
      let sheet = workbook.addWorksheet("Export Data Sheet");
      // 设置默认行高
      sheet.properties.defaultRowHeight = 20;
      // 设置列
      sheet.columns = xslColunms;
      sheet.addRows(exportData);
      // 创建文件及文件夹
      const dir = this.exportPath;
      const fileName =
        moment(new Date()).format("YYYYMMDDHHMMSS") + "export.xlsx";
      const fullPath = dir + "/" + fileName;
      // 如果没有目录则创建
      fs.ensureDir(dir)
        .then(() => {
          // 写文件
          workbook.xlsx.writeFile(fullPath).then(() => {
            this.isExport = false;

            // 在文件管理器中显示给定的文件,如果可以,'选中'该文件
            shell.showItemInFolder(dir);
            // 播放哔哔的声音
            shell.beep();

            // 打开文件
            shell.openItem(fullPath);
          });
        })
        .catch(err => {
          this.$message.info('导出失败')
        });
    },
    userNameError() {
      const { getFieldError, isFieldTouched } = this.form;
      return isFieldTouched("productType") && getFieldError("productType");
    },
    // Only show error after a field is touched.
    passwordError() {
      const { getFieldError, isFieldTouched } = this.form;
      return isFieldTouched("password") && getFieldError("password");
    },
    handleSubmit(e) {}
  },
  components: {
    Header,
    TaskDrawer
  }
};
</script>

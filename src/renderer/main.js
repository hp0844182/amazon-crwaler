import Vue from 'vue'
import axios from 'axios'
import {Modal, Menu, Dropdown, Badge, List, Divider, Tooltip, Checkbox ,Table,Form,Button,Icon,Input,Select,message,Drawer } from "ant-design-vue";
import App from './App'
import router from './router'
import store from './store'
// import 'ant-design-vue/dist/antd.css';
if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.prototype.$message = message
Vue.prototype.$Modal = Modal
Vue.config.productionTip = false
Vue.use(Checkbox);
Vue.use(Table);
Vue.use(Form);
Vue.use(Button);
Vue.use(Icon);
Vue.use(Input);
Vue.use(Select);
Vue.use(Drawer);
Vue.use(Tooltip)
Vue.use(Divider);
Vue.use(List);
Vue.use(Badge);
Vue.use(Dropdown);
Vue.use(Menu);
Vue.use(Modal);
/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')

import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'spider',
      component: require('@/components/spider').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})

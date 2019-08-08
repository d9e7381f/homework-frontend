import Vue from 'vue'
import store from '@/store'
import axios from 'axios'

Vue.prototype.$http = axios
axios.defaults.baseURL = '/api'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
axios.defaults.xsrfCookieName = 'csrftoken'

/**
 * @param url
 * @param method get|post|put|delete...
 * @param params like queryString. if a url is index?a=1&b=2, params = {a: '1', b: '2'}
 * @param data post data, use for method put|post
 * @returns {Promise}
 */
function ajax (url, method, options) {
    if (options !== undefined) {
      var {params = {}, data = {}} = options
    } else {
      params = data = {}
    }
    return new Promise((resolve, reject) => {
      axios({
        url,
        method,
        params,
        data
      }).then(res => {
        // API正常返回(status=20x), 是否错误通过有无error判断
        if (res.data.error !== null) {
          if (res.data.data === 'https://cas.dgut.edu.cn/?appid=oj') {
            Vue.prototype.$error('未登录')
            resolve(res)
          } else {
            Vue.prototype.$error(res.data.data)
            reject(res)
            // 若后端返回为登录，则为session失效，应退出当前登录用户
            if (res.data.data.startsWith('Please login')) {
              store.dispatch('changeModalStatus', {'mode': 'login', 'visible': true})
            }
          }
        } else {
          resolve(res)
          if (method !== 'get') {
            Vue.prototype.$success('Succeeded')
          }
        }
      }, res => {
        // API请求异常，一般为Server error 或 network error
        reject(res)
        Vue.prototype.$error(res.data.data)
      })
    })
  }
  
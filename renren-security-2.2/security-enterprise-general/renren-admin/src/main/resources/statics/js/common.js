(function () {
  // 在当前窗口作用域下，储存父窗口window对象
  window.win = self !== top ? window.parent : window;

  /**
   * HTTP 请求处理
   */
  var http = Vue.prototype.$http = axios.create({
    baseURL: window.SITE_CONFIG['apiURL'],
    timeout: 1000 * 180,
    withCredentials: true
  });
  // 请求拦截
  http.interceptors.request.use(function (config) {
    config.headers['Accept-Language'] = Cookies.get('language') || 'zh-CN';
    // 默认参数
    var defaults = {};
    // 防止缓存，GET请求默认带_t参数
    if (config.method === 'get') {
      config.params = _.merge({}, config.params, { '_t': new Date().getTime() });
    }
    if (_.isPlainObject(config.params)) {
      config.params = _.merge({}, defaults, config.params);
    }
    if (_.isPlainObject(config.data)) {
      config.data = _.merge({}, defaults, config.data);
      if (/^application\/x-www-form-urlencoded/.test(config.headers['content-type'])) {
        config.data = Qs.stringify(config.data);
      }
    }
    return config;
  }, function (error) {
    return Promise.reject(error);
  });
  // 响应拦截
  http.interceptors.response.use(function (response) {
    if (response.data.code === 401) {
      win.location.href = 'login.html';
      return Promise.reject(response.data.msg);
    }
    return response;
  }, function (error) {
    console.error(error);
    return Promise.reject(error);
  });

  /**
   * 权限
   */
  Vue.prototype.$hasPermission = function (key) {
    return win.SITE_CONFIG['permissions'].indexOf(key) !== -1 || false;
  };

  /**
   * 工具类
   */
  Vue.prototype.$utils = {
    // 获取svg图标(id)列表
    getIconList: function () {
      var res = [];
      var list = document.querySelectorAll('svg symbol')
      for(var i = 0; i < list.length; i++){
        res.push(list[i].id);
      }
      return res;
    },
    // 获取url地址栏参数
    getRequestParams: function () {
      var str  = win.location.search || win.location.hash.indexOf('?') >= 1 ? win.location.hash.replace(/.*(\?.*)/, '$1') : '';
      var args = {};
      if (!/\^?(=+)/.test(str)) {
        return args;
      }
      var pairs = str.substring(1).split('&');
      var pos   = null;
      for(var i = 0; i < pairs.length; i++) {
        pos = pairs[i].split('=');
        if(pos == -1) {
          continue;
        }
        args[pos[0]] = pos[1];
      }
      return args;
    }
  };

  /**
   * 验证
   */
  Vue.prototype.$validate = {
    // 邮箱
    isEmail: function (s) {
      return /^([a-zA-Z0-9._-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$/.test(s);
    },
    // 手机号码
    isMobile: function (s) {
      return /^1[0-9]{10}$/.test(s);
    },
    // 电话号码
    isPhone: function (s) { 
      return /^([0-9]{3,4}-)?[0-9]{7,8}$/.test(s);
    },
    // URL地址
    isURL: function (s) { 
      return /^http[s]?:\/\/.*/.test(s);
    }
  };

  /**
   * main-sidebar-submenu组件
   */
  (function () {
    var self = null;
    Vue.component('main-sidebar-submenu', {
      name: 'main-sidebar-submenu',
      template: '\
        <el-submenu v-if="menu.children && menu.children.length >= 1" :index="menu.id" :popper-append-to-body="false">\
          <template slot="title">\
            <svg class="icon-svg aui-sidebar__menu-icon" aria-hidden="true"><use :xlink:href="\'#\' + menu.icon"></use></svg>\
            <span>{{ menu.name }}</span>\
          </template>\
          <main-sidebar-submenu v-for="item in menu.children" :key="item.id" :menu="item"></main-sidebar-submenu>\
        </el-submenu>\
        <el-menu-item v-else :index="menu.id" @click="gotoRouteHandle(menu.id)">\
          <svg class="icon-svg aui-sidebar__menu-icon" aria-hidden="true"><use :xlink:href="\'#\' + menu.icon"></use></svg>\
          <span>{{ menu.name }}</span>\
        </el-menu-item>\
      ',
      props: {
        menu: {
          type: Object,
          required: true
        }
      },
      beforeCreate: function () {
        self = this;
      },
      methods: {
        // 通过menuId与路由列表进行匹配跳转至指定路由
        gotoRouteHandle: function (menuId) {
          var route = win.SITE_CONFIG.routeList.filter(function (item) { return item.menuId === menuId })[0];
          if (route) {
            win.location.hash = route.name;
          }
        }
      }
    });
  })();
})();
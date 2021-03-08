(function () {
  var vm = window.vm = new Vue({
    el: '.aui-wrapper',
    i18n: window.SITE_CONFIG.i18n,
    data: function () {
      return {
        loading: true,
        // 导航条, 布局风格, defalut(白色) / colorful(鲜艳)
        navbarLayoutType: 'colorful',
        // 侧边栏, 布局皮肤, default(白色) / dark(黑色)
        sidebarLayoutSkin: 'dark',
        // 侧边栏, 折叠状态
        sidebarFold: false,
        // 侧边栏, 菜单
        sidebarMenuList: [],
        sidebarMenuActiveName: '',
        // 内容, 是否需要刷新
        contentIsNeedRefresh: false,
        // 内容, 标签页
        contentTabs: [
          {
            'menuId': 'home',
            'name': 'home',
            'title': 'home',
            'url': './home.html',
            'params': {}
          }
        ],
        contentTabsActiveName: '',
        // 用户信息
        user: {
          id: 0,
          name: '',
          realName: '',
          superAdmin: 0
        }
      }
    },
    components: {
      'main-navbar': fnMainNavbarComponent(),
      'main-sidebar': fnMainSidebarComponent(),
      'main-content': fnMainContentComponent(),
      'main-theme-tools': fnMainThemeToolsComponent()
    },
    watch: {
      '$i18n.locale': 'i18nHandle'
    },
    beforeCreate: function () {
      vm = this;
    },
    created: function () {
      vm.getMenuList().then(function () {
        vm.addMenuRouteList(vm.sidebarMenuList);
        Promise.all([
          vm.getUserInfo(),
          vm.getPermissions()
        ]).then(function () {
          vm.loading = false;
          vm.$nextTick(function () {
            vm.routerHandle(true);
            vm.i18nHandle(vm.$i18n.locale);
          });
        });
      });
    },
    methods: {
      // 设置导航条, 布局风格
      setNavbarLayoutType: function (val) {
        vm.navbarLayoutType = val;
      },
      // 设置侧边栏, 布局皮肤
      setSidebarLayoutType: function (val) {
        vm.sidebarLayoutSkin = val;
      },
      // 设置侧边栏, 菜单选中
      setSidebarMenuActiveName: function (val) {
        vm.sidebarMenuActiveName = val;
      },
      // 设置内容, 标签页
      setContentTabs: function (val) {
        vm.contentTabs = val;
      },
      // 设置内容, 标签页选中
      setContentTabsActiveName: function (val) {
        vm.contentTabsActiveName = val;
      },
      // 获取菜单列表
      getMenuList: function () {
        return vm.$http.get('/sys/menu/nav').then(function (res) {
          if (res.data.code !== 0) {
            return vm.$message.error(res.data.msg);
          }
          vm.sidebarMenuList = res.data.data;
        }).catch(function () {});
      },
      // 添加菜单路由列表
      addMenuRouteList: function (menuList) {
        var temp = [];
        for (var i = 0; i < menuList.length; i++) {
          if (menuList[i].children && menuList[i].children.length >= 1) {
            temp = temp.concat(menuList[i].children);
            continue;
          }
          // 组装路由
          var route = {
            'menuId': menuList[i].id,
            'name': '',
            'title': menuList[i].name,
            'url': '',
            'params': {}
          };
          var URL = (menuList[i].url || '').replace(/{{([^}}]+)?}}/g, function (s1, s2) { return eval(s2); }); // URL支持{{ window.xxx }}占位符变量
          if (vm.$validate.isURL(URL)) {
            route.name = 'i-' + menuList[i].id;
            route.url = URL;
          } else {
            URL = URL.replace(/(.+)\.html/, '$1').replace(/^\//, '').replace(/_/g, '-');
            route.name = URL.replace(/\//g, '-');
            route.url = './modules/' + URL + '.html';
          }
          window.SITE_CONFIG.routeList.push(route);
        }
        if (temp.length >= 1) {
          return vm.addMenuRouteList(temp);
        }
      },
      // 路由
      routerHandle: function (isInit) {
        var routeName = window.location.hash.substring(1).split('?')[0];
        // 初始化
        if (isInit && typeof(isInit) === 'boolean') {
          window.addEventListener('hashchange', vm.routerHandle);
          // 如路由为空, 默认为home首页
          if (!/\S/.test(routeName)) {
            window.location.hash = 'home';
            return false;
          }
          // 如重定向路由包含__双下划线, 为临时添加路由
          if (/__.*/.test(routeName)) {
            window.location.hash = routeName.replace(/__.*/, '');
            return false;
          }
        }
        var route = window.SITE_CONFIG.routeList.filter(function (item) { return item.name === routeName })[0];
        if (!route) {
          return false;
        }
        var tab = vm.contentTabs.filter(function (item) { return item.name === routeName })[0];
        if (!tab) {
          tab = route;
          vm.contentTabs.push(tab);
        }
        vm.sidebarMenuActiveName = tab.menuId;
        vm.contentTabsActiveName = tab.name;
      },
      // 国际化
      i18nHandle: function (val, oldVal) {
        Cookies.set('language', val);
        document.querySelector('html').setAttribute('lang', val);
        document.title = vm.$i18n.messages[val].brand.lg;
        if (oldVal) {
          window.location.reload();
        }
      },
      // 获取当前管理员信息
      getUserInfo: function () {
        return vm.$http.get('/sys/user/info').then(function (res) {
          if (res.data.code !== 0) {
            return vm.$message.error(res.data.msg);
          }
          vm.user.id = res.data.data.id;
          vm.user.name = res.data.data.username;
          vm.user.realName = res.data.data.realName;
          vm.user.superAdmin = res.data.data.superAdmin;
        }).catch(function () {});
      },
      // 获取权限
      getPermissions: function () {
        return vm.$http.get('/sys/menu/permissions').then(function (res) {
          if (res.data.code !== 0) {
            return vm.$message.error(res.data.msg);
          }
          window.SITE_CONFIG['permissions'] = res.data.data;
        }).catch(function () {});
      }
    }
  });
})();

/**
 * main-navbar组件
 */
function fnMainNavbarComponent () {
  var self = null;
  return {
    template: '\
      <nav class="aui-navbar" :class="\'aui-navbar--\' + navbarLayoutType">\
        <div class="aui-navbar__header">\
          <h1 class="aui-navbar__brand">\
            <a class="aui-navbar__brand-lg" href="javascript:;">{{ $t(\'brand.lg\') }}</a>\
            <a class="aui-navbar__brand-mini" href="javascript:;">{{ $t(\'brand.mini\') }}</a>\
          </h1>\
        </div>\
        <div class="aui-navbar__body">\
          <el-menu class="aui-navbar__menu mr-auto" mode="horizontal">\
            <el-menu-item index="1" @click="$emit(\'switch-sidebar-fold\')">\
              <svg class="icon-svg aui-navbar__icon-menu aui-navbar__icon-menu--switch" aria-hidden="true"><use xlink:href="#icon-outdent"></use></svg>\
            </el-menu-item>\
            <el-menu-item index="2" @click="refreshHandle()">\
              <svg class="icon-svg aui-navbar__icon-menu aui-navbar__icon-menu--refresh" aria-hidden="true"><use xlink:href="#icon-sync"></use></svg>\
            </el-menu-item>\
          </el-menu>\
          <el-menu class="aui-navbar__menu" mode="horizontal">\
            <el-menu-item index="1">\
              <el-dropdown placement="bottom" :show-timeout="0">\
                <el-button size="mini">{{ $t(\'_lang\') }}</el-button>\
                <el-dropdown-menu slot="dropdown">\
                  <el-dropdown-item v-for="(val, key) in $i18n.messages" :key="key" @click.native="$i18n.locale = key">{{ val._lang }}</el-dropdown-item>\
                </el-dropdown-menu>\
              </el-dropdown>\
            </el-menu-item>\
            <el-menu-item index="2">\
              <a href="//www.renren.io/" target="_blank">\
                <svg class="icon-svg aui-navbar__icon-menu" aria-hidden="true"><use xlink:href="#icon-earth"></use></svg>\
              </a>\
            </el-menu-item>\
            <el-menu-item index="3" @click="fullscreenHandle()">\
              <svg class="icon-svg aui-navbar__icon-menu" aria-hidden="true"><use xlink:href="#icon-fullscreen"></use></svg>\
            </el-menu-item>\
            <el-menu-item index="4" class="aui-navbar__avatar">\
              <el-dropdown placement="bottom" :show-timeout="0">\
                <span class="el-dropdown-link">\
                  <img src="./statics/img/avatar.png">\
                  <span>{{ user.realName }}</span>\
                  <i class="el-icon-arrow-down"></i>\
                </span>\
                <el-dropdown-menu slot="dropdown">\
                  <el-dropdown-item @click.native="updatePasswordHandle()">{{ $t(\'updatePassword.title\') }}</el-dropdown-item>\
                  <el-dropdown-item @click.native="logoutHandle()">{{ $t(\'logout\') }}</el-dropdown-item>\
                </el-dropdown-menu>\
              </el-dropdown>\
            </el-menu-item>\
          </el-menu>\
        </div>\
        <!-- 弹窗, 修改密码 -->\
        <update-password v-if="updatePassowrdVisible" ref="updatePassowrd" :user="user"></update-password>\
      </nav>\
    ',
    data: function () {
      return {
        updatePassowrdVisible: false
      }
    },
    props: {
      navbarLayoutType: {
        type: String,
        required: true
      },
      contentTabsActiveName: {
        type: String,
        required: true
      },
      user: {
        type: Object,
        required: true
      }
    },
    components: {
      'update-password': fnMainNavbarUpdatePasswordComponent()
    },
    beforeCreate: function () {
      self = this;
    },
    methods: {
      // 刷新
      refreshHandle: function () {
        var iframeBox = document.querySelector('#pane-' + vm.contentTabsActiveName + ' > iframe');
        if (iframeBox) {
          iframeBox.contentWindow.location.reload(true);
        }
      },
      // 全屏
      fullscreenHandle: function () {
        if (!screenfull.enabled) {
          return self.$message({
            message: self.$t('fullscreen.prompt'),
            type: 'warning',
            duration: 500
          });
        }
        screenfull.toggle();
      },
      // 修改密码
      updatePasswordHandle: function () {
        self.updatePassowrdVisible = true;
        self.$nextTick(function () {
          self.$refs.updatePassowrd.init();
        });
      },
      // 退出
      logoutHandle: function () {
        self.$confirm(self.$t('prompt.info', { 'handle': self.$t('logout') }), self.$t('prompt.title'), {
          confirmButtonText: self.$t('confirm'),
          cancelButtonText: self.$t('cancel'),
          type: 'warning'
        }).then(function () {
          self.$http.post('/logout').then(function (res) {
            if (res.data.code !== 0) {
              return self.$message.error(res.data.msg);
            }
            window.location.href = 'login.html';
          }).catch(function () {});
        }).catch(function () {});
      }
    }
  }
};

/**
 * main-navbar-update-password组件
 */
function fnMainNavbarUpdatePasswordComponent () {
  var self = null;
  return {
    template: '\
      <el-dialog\
        :visible.sync="visible"\
        :title="$t(\'updatePassword.title\')"\
        :close-on-click-modal="false"\
        :close-on-press-escape="false"\
        :append-to-body="true">\
        <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmitHandle()" label-width="120px">\
          <el-form-item :label="$t(\'updatePassword.username\')">\
            <span>{{ user.name }}</span>\
          </el-form-item>\
          <el-form-item prop="password" :label="$t(\'updatePassword.password\')">\
            <el-input v-model="dataForm.password" type="password" :placeholder="$t(\'updatePassword.password\')"></el-input>\
          </el-form-item>\
          <el-form-item prop="newPassword" :label="$t(\'updatePassword.newPassword\')">\
            <el-input v-model="dataForm.newPassword" type="password" :placeholder="$t(\'updatePassword.newPassword\')"></el-input>\
          </el-form-item>\
          <el-form-item prop="comfirmPassword" :label="$t(\'updatePassword.comfirmPassword\')">\
            <el-input v-model="dataForm.comfirmPassword" type="password" :placeholder="$t(\'updatePassword.comfirmPassword\')"></el-input>\
          </el-form-item>\
        </el-form>\
        <template slot="footer">\
          <el-button @click="visible = false">{{ $t(\'cancel\') }}</el-button>\
          <el-button type="primary" @click="dataFormSubmitHandle()">{{ $t(\'confirm\') }}</el-button>\
        </template>\
      </el-dialog>\
    ',
    data: function () {
      return {
        visible: false,
        dataForm: {
          password: '',
          newPassword: '',
          comfirmPassword: ''
        }
      }
    },
    props: {
      user: {
        type: Object,
        required: true
      }
    },
    computed: {
      dataRule: function () {
        var validateComfirmPassword = function (rule, value, callback) {
          if (self.dataForm.newPassword !== value) {
            return callback(new Error(self.$t('updatePassword.validate.comfirmPassword')));
          }
          callback();
        }
        return {
          password: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' }
          ],
          newPassword: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' }
          ],
          comfirmPassword: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' },
            { validator: validateComfirmPassword, trigger: 'blur' }
          ]
        }
      }
    },
    beforeCreate: function () {
      self = this;
    },
    methods: {
      init: function () {
        self.visible = true;
        self.$nextTick(function () {
          self.$refs['dataForm'].resetFields();
        })
      },
      // 表单提交
      dataFormSubmitHandle: _.debounce(function () {
        self.$refs['dataForm'].validate(function (valid) {
          if (!valid) {
            return false;
          }
          self.$http.put('/sys/user/password', self.dataForm).then(function (res) {
            if (res.data.code !== 0) {
              return self.$message.error(res.data.msg);
            }
            self.$message({
              message: self.$t('prompt.success'),
              type: 'success',
              duration: 500,
              onClose: function () {
                self.visible = false;
                window.location.href = 'login.html';
              }
            });
          }).catch(function () {});
        })
      }, 1000, { 'leading': true, 'trailing': false })
    }
  }
};

/**
 * main-sidebar组件
 */
function fnMainSidebarComponent () {
  return {
    template: '\
      <aside :class="[\'aui-sidebar\', \'aui-sidebar--\' + sidebarLayoutSkin]">\
        <div class="aui-sidebar__inner">\
          <el-menu\
            :default-active="sidebarMenuActiveName"\
            :collapse="sidebarFold"\
            :unique-opened="true"\
            :collapseTransition="false"\
            class="aui-sidebar__menu">\
            <main-sidebar-submenu v-for="menu in sidebarMenuList" :key="menu.id" :menu="menu"></main-sidebar-submenu>\
          </el-menu>\
        </div>\
      </aside>\
    ',
    props: {
      sidebarLayoutSkin: {
        type: String,
        required: true
      },
      sidebarFold: {
        type: Boolean,
        required: true
      },
      sidebarMenuList: {
        type: Array,
        required: true
      },
      sidebarMenuActiveName: {
        type: String,
        required: true
      }
    }
  }
};

/**
 * main-content组件
 */
function fnMainContentComponent () {
  var self = null;
  return {
    template: '\
      <main class="aui-content aui-content--tabs">\
        <el-dropdown class="aui-content--tabs-tools">\
          <i class="el-icon-arrow-down"></i>\
          <el-dropdown-menu slot="dropdown" :show-timeout="0">\
            <el-dropdown-item @click.native="tabRemoveHandle(selfContentTabsActiveName)">{{ $t(\'contentTabs.closeCurrent\') }}</el-dropdown-item>\
            <el-dropdown-item @click.native="tabsCloseOtherHandle()">{{ $t(\'contentTabs.closeOther\') }}</el-dropdown-item>\
            <el-dropdown-item @click.native="tabsCloseAllHandle()">{{ $t(\'contentTabs.closeAll\') }}</el-dropdown-item>\
          </el-dropdown-menu>\
        </el-dropdown>\
        <el-tabs v-model="selfContentTabsActiveName" @tab-click="tabSelectedHandle" @tab-remove="tabRemoveHandle">\
          <el-tab-pane\
            v-for="item in selfContentTabs"\
            :key="item.name"\
            :name="item.name"\
            :label="item.title"\
            :closable="item.name !== \'home\'"\
            class="is-iframe">\
            <template v-if="item.name === \'home\'">\
              <svg slot="label" class="icon-svg aui-content--tabs-icon-nav" aria-hidden="true"><use xlink:href="#icon-home"></use></svg>\
            </template>\
            <iframe v-show="iframeVisibleHandle(item)" :src="item.url" width="100%" height="100%" frameborder="0" scrolling="yes"></iframe>\
          </el-tab-pane>\
        </el-tabs>\
      </main>\
    ',
    props: {
      sidebarMenuActiveName: {
        type: String,
        required: true
      },
      contentTabs: {
        type: Array,
        required: true
      },
      contentTabsActiveName: {
        type: String,
        required: true
      }
    },
    computed: {
      selfSidebarMenuActiveName: {
        get: function () { return self.sidebarMenuActiveName; },
        set: function (val) { self.$emit('set-sidebar-menu-active-name', val); }
      },
      selfContentTabs: {
        get: function () { return self.contentTabs; },
        set: function (val) { self.$emit('set-content-tabs', val); }
      },
      selfContentTabsActiveName: {
        get: function () { return self.contentTabsActiveName; },
        set: function (val) { self.$emit('set-content-tabs-active-name', val); }
      }
    },
    beforeCreate: function () {
      self = this;
    },
    methods: {
      iframeVisibleHandle: function (item) {
        return item.name === window.location.hash.substring(1).split('?')[0];
      },
      // tabs, 选中tab
      tabSelectedHandle: function (tab) {
        tab = self.selfContentTabs.filter(function (item) { return item.name === tab.name; })[0];
        if (tab) {
          window.location.hash = tab.name;
        }
      },
      // tabs, 删除tab
      tabRemoveHandle: function (tabName) {
        if (tabName === 'home') {
          return false;
        }
        self.selfContentTabs = self.selfContentTabs.filter(function (item) { return item.name !== tabName; });
        self.$nextTick(function () {
          if (self.selfContentTabs.length <= 0) {
            self.selfSidebarMenuActiveName = self.selfContentTabsActiveName = 'home'
            return false;
          }
          // 当前选中tab被删除
          if (tabName === self.selfContentTabsActiveName) {
            window.location.hash = self.selfContentTabs[self.selfContentTabs.length - 1].name;
          }
        });
      },
      // tabs, 关闭其它
      tabsCloseOtherHandle: function () {
        self.selfContentTabs = self.selfContentTabs.filter(function (item) {
          return item.name === 'home' || item.name === self.selfContentTabsActiveName;
        })
      },
      // tabs, 关闭全部
      tabsCloseAllHandle: function () {
        self.selfContentTabs = self.selfContentTabs.filter(function (item) { return item.name === 'home'; });
        window.location.hash = 'home';
      }
    }
  }
};

/**
 * main-theme-tools组件
 */
function fnMainThemeToolsComponent () {
  var self = null;
  return {
    template: '\
      <div class="aui-theme-tools" :class="{ \'aui-theme-tools--open\': isOpen }">\
        <div class="aui-theme-tools__toggle" @click="isOpen = !isOpen">\
          <svg class="icon-svg" aria-hidden="true"><use xlink:href="#icon-setting"></use></svg>\
        </div>\
        <div class="aui-theme-tools__content">\
          <div class="aui-theme-tools__item">\
            <h3>Navbar</h3>\
            <el-checkbox v-model="selfNavbarLayoutType" true-label="colorful" false-label="white">colorful 鲜艳</el-checkbox>\
          </div>\
          <div class="aui-theme-tools__item">\
            <h3>Sidebar</h3>\
            <el-checkbox v-model="selfSidebarLayoutSkin" true-label="dark" false-label="white">dark 黑色</el-checkbox>\
          </div>\
          <div class="aui-theme-tools__item">\
            <h3>Theme</h3>\
            <el-radio-group v-model="themeColor" @change="themeColorChangeHandle">\
              <el-radio v-for="item in themeList" :key="item.name" :label="item.name">{{ item.name }} {{ item.desc }}</el-radio>\
            </el-radio-group>\
          </div>\
        </div>\
      </div>\
    ',
    data: function () {
      return {
        isOpen: false,
        themeList: [
          {  name: 'default',   color: '#409EFF', desc: '默认色', hasBuild: false },
          {  name: 'cyan',      color: '#0BB2D4', desc: '青色',   hasBuild: false },
          {  name: 'blue',      color: '#3E8EF7', desc: '蓝色',   hasBuild: false },
          {  name: 'green',     color: '#11C26D', desc: '绿色',   hasBuild: false },
          {  name: 'turquoise', color: '#17B3A3', desc: '蓝绿色', hasBuild: false },
          {  name: 'indigo',    color: '#667AFA', desc: '靛青色', hasBuild: false },
          {  name: 'brown',     color: '#997B71', desc: '棕色',   hasBuild: false },
          {  name: 'purple',    color: '#9463F7', desc: '紫色',   hasBuild: false },
          {  name: 'gray',      color: '#757575', desc: '灰色',   hasBuild: false },
          {  name: 'orange',    color: '#EB6709', desc: '橙色',   hasBuild: false },
          {  name: 'pink',      color: '#F74584', desc: '粉红色', hasBuild: false },
          {  name: 'yellow',    color: '#FCB900', desc: '黄色',   hasBuild: false },
          {  name: 'red',       color: '#FF4C52', desc: '红色',   hasBuild: false }
        ],
        themeColor: 'turquoise'
      }
    },
    props: {
      navbarLayoutType: {
        type: String,
        required: true
      },
      sidebarLayoutSkin: {
        type: String,
        required: true
      }
    },
    computed: {
      selfNavbarLayoutType: {
        get: function () { return self.navbarLayoutType; },
        set: function (val) { self.$emit('set-navbar-layout-type', val); }
      },
      selfSidebarLayoutSkin: {
        get: function () { return self.sidebarLayoutSkin; },
        set: function (val) { self.$emit('set-sidebar-layout-type', val); }
      }
    },
    beforeCreate: function () {
      self = this;
    },
    methods: {
      // 切换主题
      themeColorChangeHandle: function (val) {
        var styleList = [
          {
            id: 'J_elementTheme',
            url: './statics/element-theme/' + val + '/index.css?t=' + new Date().getTime()
          },
          {
            id: 'J_auiTheme',
            url: './statics/element-theme/' + val + '/aui.css?t=' + new Date().getTime()
          }
        ]
        for (var i = 0; i < styleList.length; i++) {
          var el = document.querySelector('#' + styleList[i].id);
          if (el) {
            el.href = styleList[i].url;
            continue;
          }
          el = document.createElement('link');
          el.id = styleList[i].id;
          el.href = styleList[i].url;
          el.rel = 'stylesheet';
          document.querySelector('head').appendChild(el);
        }
      }
    }
  }
};
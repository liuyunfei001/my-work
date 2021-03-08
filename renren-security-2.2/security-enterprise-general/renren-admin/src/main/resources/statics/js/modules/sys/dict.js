(function () {
  var vm = window.vm = new Vue({
    el: '.aui-wrapper',
    i18n: window.SITE_CONFIG.i18n,
    mixins: [window.SITE_CONFIG.mixinViewModule],
    data: function () {
      return {
        mixinViewModuleOptions: {
          activatedIsNeed: false,
          getDataListURL: '/sys/dict/page',
          getDataListIsPage: true,
          deleteURL: '/sys/dict',
          deleteIsBatch: true
        },
        dataForm: {
          pid: '0',
          dictName: '',
          dictType: '',
          dictValue: ''
        }
      }
    },
    components: {
      'add-or-update': fnAddOrUpdateComponent()
    },
    beforeCreate: function () {
      vm = this;
    },
    created: function () {
      // 通过路由参数pid, 控制列表请求操作
      var routeName = win.location.hash.substring(1).split('?')[0];
      var route = win.SITE_CONFIG['routeList'].filter(function (item) { return item.name === routeName; })[0];
      if (route && route.params) {
        vm.dataForm.pid = route.params.pid || '0';
        if (vm.dataForm.pid !== '0') {
          vm.mixinViewModuleOptions.getDataListURL = '/sys/dict/list';
          vm.mixinViewModuleOptions.getDataListIsPage = false;
          vm.dataForm.dictType = route.params.type || '';
        }
      }
      vm.getDataList();
    },
    methods: {
      // 子级
      childHandle: function (row) {
        // 组装路由名称, 并判断是否已添加, 如是: 则直接跳转
        var currentRouteName = win.location.hash.substring(1).split('?')[0];
        var routeName = currentRouteName + '__' + row.id;
        var route = win.SITE_CONFIG['routeList'].filter(function (item) { return item.name === routeName; })[0];
        if (route) {
          win.location.hash = routeName;
          return true;
        }
        // 否则: 添加并全局变量保存, 再跳转
        var currentRoute = win.SITE_CONFIG['routeList'].filter(function (item) { return item.name === currentRouteName; })[0];
        route = {
          'menuId': currentRoute.menuId,
          'name': routeName,
          'title': currentRoute.title + row.dictType,
          'url': currentRoute.url,
          'params': {
            'pid': row.id,
            'type': row.dictType
          }
        };
        win.SITE_CONFIG['routeList'].push(route);
        win.location.hash = routeName;
      },
      // 新增 / 修改
      addOrUpdateHandle: function (row) {
        row = row || {};
        vm.addOrUpdateVisible = true;
        vm.$nextTick(function () {
          vm.$refs.addOrUpdate.dataForm.id = row.id;
          vm.$refs.addOrUpdate.dataForm.pid = vm.dataForm.pid;
          vm.$refs.addOrUpdate.dataForm.dictType = row.dictType || vm.dataForm.dictType || '';
          vm.$refs.addOrUpdate.init();
        })
      }
    }
  });
})();

/**
 * add-or-update组件
 */
function fnAddOrUpdateComponent () {
  var self = null;
  return {
    template: '\
      <el-dialog :visible.sync="visible" :title="!dataForm.id ? $t(\'add\') : $t(\'update\')" :close-on-click-modal="false" :close-on-press-escape="false" :fullscreen="true">\
        <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmitHandle()" label-width="120px">\
          <el-form-item prop="dictName" :label="$t(\'dict.dictName\')">\
            <el-input v-model="dataForm.dictName" :placeholder="$t(\'dict.dictName\')"></el-input>\
          </el-form-item>\
          <el-form-item v-if="dataForm.pid === \'0\'" prop="dictType" :label="$t(\'dict.dictType\')">\
            <el-input v-model="dataForm.dictType" :placeholder="$t(\'dict.dictType\')"></el-input>\
          </el-form-item>\
          <el-form-item v-if="dataForm.pid !== \'0\'" prop="dictValue" :label="$t(\'dict.dictValue\')">\
            <el-input v-model="dataForm.dictValue" :placeholder="$t(\'dict.dictValue\')"></el-input>\
          </el-form-item>\
          <el-form-item prop="sort" :label="$t(\'dict.sort\')">\
            <el-input-number v-model="dataForm.sort" controls-position="right" :min="0" :label="$t(\'dict.sort\')"></el-input-number>\
          </el-form-item>\
          <el-form-item prop="remark" :label="$t(\'dict.remark\')">\
            <el-input v-model="dataForm.remark" :placeholder="$t(\'dict.remark\')"></el-input>\
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
          id: '',
          pid: '0',
          dictName: '',
          dictType: '',
          dictValue: '',
          sort: 0,
          remark: ''
        }
      }
    },
    computed: {
      dataRule: function () {
        return {
          dictName: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' }
          ],
          dictType: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' }
          ],
          code: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' }
          ],
          dictValue: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' }
          ],
          sort: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' }
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
          if (self.dataForm.id) {
            self.getInfo();
          }
        });
      },
      // 获取信息
      getInfo: function () {
        self.$http.get('/sys/dict/' + self.dataForm.id).then(function (res) {
          if (res.data.code !== 0) {
            return self.$message.error(res.data.msg);
          }
          self.dataForm = _.merge({}, self.dataForm, res.data.data);
        }).catch(function () {});
      },
      // 表单提交
      dataFormSubmitHandle: _.debounce(function () {
        self.$refs['dataForm'].validate(function (valid) {
          if (!valid) {
            return false;
          }
          self.$http[!self.dataForm.id ? 'post' : 'put']('/sys/dict', self.dataForm).then(function (res) {
            if (res.data.code !== 0) {
              return self.$message.error(res.data.msg);
            }
            self.$message({
              message: self.$t('prompt.success'),
              type: 'success',
              duration: 500,
              onClose: function () {
                self.visible = false;
                self.$emit('refresh-data-list');
              }
            });
          }).catch(function () {});
        });
      }, 1000, { 'leading': true, 'trailing': false })
    }
  }
};
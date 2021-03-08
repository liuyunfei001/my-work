(function () {
  var vm = window.vm = new Vue({
    el: '.aui-wrapper',
    i18n: window.SITE_CONFIG.i18n,
    mixins: [window.SITE_CONFIG.mixinViewModule],
    data: function () {
      return {
        mixinViewModuleOptions: {
          getDataListURL: '/act/model/page',
          getDataListIsPage: true,
          deleteURL: '/act/model',
          deleteIsBatch: true
        },
        dataForm: {
          name: '',
          key: ''
        }
      }
    },
    components: {
      'add-or-update': fnAddOrUpdateComponent()
    },
    beforeCreate: function () {
      vm = this;
    },
    methods: {
      // 获取在线设计url地址
      getModelerURL: function (id) {
        return window.SITE_CONFIG['apiURL'] + '/modeler.html?modelId=' + id;
      },
      // 获取导出url地址
      getExportURL: function (id) {
        return window.SITE_CONFIG['apiURL'] + '/act/model/export/' + id;
      },
      // 部署
      deployHandle: function (id) {
        vm.$confirm(vm.$t('prompt.info', { 'handle': vm.$t('model.deploy') }), vm.$t('prompt.title'), {
          confirmButtonText: vm.$t('confirm'),
          cancelButtonText: vm.$t('cancel'),
          type: 'warning'
        }).then(function () {
          vm.$http.post('/act/model/deploy/' + id).then(function (res) {
            if (res.data.code !== 0) {
              return vm.$message.error(res.data.msg)
            }
            vm.$message({
              message: vm.$t('prompt.success'),
              type: 'success',
              duration: 500,
              onClose: function () {
                vm.getDataList();
              }
            });
          }).catch(function () {});
        }).catch(function () {});
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
          <el-form-item prop="name" :label="$t(\'model.name\')">\
            <el-input v-model="dataForm.name" :placeholder="$t(\'model.name\')"></el-input>\
          </el-form-item>\
          <el-form-item prop="key" :label="$t(\'model.key\')">\
            <el-input v-model="dataForm.key" :placeholder="$t(\'model.key\')"></el-input>\
          </el-form-item>\
          <el-form-item prop="description" :label="$t(\'model.description\')">\
            <el-input v-model="dataForm.description" :placeholder="$t(\'model.description\')"></el-input>\
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
          name: '',
          key: '',
          description: ''
        }
      }
    },
    computed: {
      dataRule: function () {
        return {
          name: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' }
          ],
          key: [
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
        });
      },
      // 表单提交
      dataFormSubmitHandle: _.debounce(function () {
        self.$refs['dataForm'].validate(function (valid) {
          if (!valid) {
            return false;
          }
          self.$http[!self.dataForm.id ? 'post' : 'put']('/act/model', self.dataForm).then(function (res) {
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
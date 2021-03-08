(function () {
  var vm = window.vm = new Vue({
    el: '.aui-wrapper',
    i18n: window.SITE_CONFIG.i18n,
    mixins: [window.SITE_CONFIG.mixinViewModule],
    data: function () {
      return {
        mixinViewModuleOptions: {
          getDataListURL: '/act/process/page',
          getDataListIsPage: true,
          deleteURL: '/act/process',
          deleteIsBatch: true,
          deleteIsBatchKey: 'deploymentId'
        },
        dataForm: {
          processName: '',
          key: ''
        },
        deployVisible: false
      }
    },
    components: {
      'deploy': fnDeployComponent()
    },
    beforeCreate: function () {
      vm = this;
    },
    methods: {
      // 获取流程(xml/image)url地址
      getResourceURL: function (id, name) {
        var params = Qs.stringify({
          'deploymentId': id,
          'resourceName': name
        });
        return window.SITE_CONFIG['apiURL'] + '/act/process/resource?' + params;
      },
      // 部署流程文件
      deployHandle: function () {
        vm.deployVisible = true;
        vm.$nextTick(function () {
          vm.$refs.deploy.init();
        })
      },
      // 激活
      activeHandle: function (id) {
        vm.$confirm(vm.$t('prompt.info', { 'handle': vm.$t('process.active') }), vm.$t('prompt.title'), {
          confirmButtonText: vm.$t('confirm'),
          cancelButtonText: vm.$t('cancel'),
          type: 'warning'
        }).then(function () {
          vm.$http.put('/act/process/active/' + id).then(function (res) {
            if (res.data.code !== 0) {
              return vm.$message.error(res.data.msg);
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
      },
      // 挂起
      suspendHandle: function (id) {
        vm.$confirm(vm.$t('prompt.info', { 'handle': vm.$t('process.suspend') }), vm.$t('prompt.title'), {
          confirmButtonText: vm.$t('confirm'),
          cancelButtonText: vm.$t('cancel'),
          type: 'warning'
        }).then(function () {
          vm.$http.put('/act/process/suspend/' + id).then(function (res) {
            if (res.data.code !== 0) {
              return vm.$message.error(res.data.msg);
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
      },
      // 转换为模型
      convertToModelHandle: function (id) {
        vm.$confirm(vm.$t('prompt.info', { 'handle': vm.$t('process.convertToModel') }), vm.$t('prompt.title'), {
          confirmButtonText: vm.$t('confirm'),
          cancelButtonText: vm.$t('cancel'),
          type: 'warning'
        }).then(function () {
          vm.$http.post('/act/process/convertToModel/' + id).then(function (res) {
            if (res.data.code !== 0) {
              return vm.$message.error(res.data.msg);
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
 * deploy组件
 */
function fnDeployComponent () {
  var self = null;
  return {
    template: '\
      <el-dialog :visible.sync="visible" :title="$t(\'process.deployFile\')" :close-on-click-modal="false" :close-on-press-escape="false">\
        <el-upload\
          name="processFile"\
          :action="url"\
          :file-list="fileList"\
          drag\
          :before-upload="beforeUploadHandle"\
          :on-success="successHandle"\
          class="text-center">\
          <i class="el-icon-upload"></i>\
          <div class="el-upload__text" v-html="$t(\'upload.text\')"></div>\
          <div class="el-upload__tip" slot="tip">{{ $t(\'upload.tip\', { \'format\': \'zip、xml、bar、bpmn\' }) }}</div>\
        </el-upload>\
      </el-dialog>\
    ',
    data: function () {
      return {
        visible: false,
        url: '',
        fileList: []
      }
    },
    beforeCreate: function () {
      self = this;
    },
    methods: {
      init: function () {
        self.visible = true;
        self.url = window.SITE_CONFIG['apiURL'] + '/act/process/deploy';
        self.fileList = [];
      },
      // 上传之前
      beforeUploadHandle: function (file) {
        if (!/.+\.zip$/.test(file.name) && !/.+\.xml$/.test(file.name) && !/.+\.bar$/.test(file.name) && !/.+\.bpmn$/.test(file.name)) {
          self.$message.error(self.$t('upload.tip', { 'format': 'zip、xml、bar、bpmn' }));
          return false;
        }
      },
      // 上传成功
      successHandle: function (res, file, fileList) {
        if (res.code !== 0) {
          return self.$message.error(res.msg);
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
      }
    }
  }
};
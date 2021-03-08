(function () {
  var vm = window.vm = new Vue({
    el: '.aui-wrapper',
    i18n: window.SITE_CONFIG.i18n,
    mixins: [window.SITE_CONFIG.mixinViewModule],
    data: function () {
      return {
        mixinViewModuleOptions: {
          getDataListURL: '/sys/schedule/page',
          getDataListIsPage: true,
          deleteURL: '/sys/schedule',
          deleteIsBatch: true
        },
        dataForm: {
          beanName: ''
        },
        logVisible: false
      }
    },
    components: {
      'add-or-update': fnAddOrUpdateComponent(),
      'log': fnLogComponent()
    },
    beforeCreate: function () {
      vm = this;
    },
    methods: {
      // 暂停
      pauseHandle: function (id) {
        if (!id && vm.dataListSelections.length <= 0) {
          return vm.$message({
            message: vm.$t('prompt.deleteBatch'),
            type: 'warning',
            duration: 500
          });
        }
        vm.$confirm(vm.$t('prompt.info', { 'handle': vm.$t('schedule.pause') }), vm.$t('prompt.title'), {
          confirmButtonText: vm.$t('confirm'),
          cancelButtonText: vm.$t('cancel'),
          type: 'warning'
        }).then(function () {
          vm.$http.put('/sys/schedule/pause', id ? [id] : vm.dataListSelections.map(function (item) { return item.id; })).then(function (res) {
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
      // 恢复
      resumeHandle: function (id) {
        if (!id && vm.dataListSelections.length <= 0) {
          return vm.$message({
            message: vm.$t('prompt.deleteBatch'),
            type: 'warning',
            duration: 500
          });
        }
        vm.$confirm(vm.$t('prompt.info', { 'handle': vm.$t('schedule.resume') }), vm.$t('prompt.title'), {
          confirmButtonText: vm.$t('confirm'),
          cancelButtonText: vm.$t('cancel'),
          type: 'warning'
        }).then(function () {
          vm.$http.put('/sys/schedule/resume', id ? [id] : vm.dataListSelections.map(function (item) { return item.id; })).then(function (res) {
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
      // 执行
      runHandle: function (id) {
        if (!id && vm.dataListSelections.length <= 0) {
          return vm.$message({
            message: vm.$t('prompt.deleteBatch'),
            type: 'warning',
            duration: 500
          });
        }
        vm.$confirm(vm.$t('prompt.info', { 'handle': vm.$t('schedule.run') }), vm.$t('prompt.title'), {
          confirmButtonText: vm.$t('confirm'),
          cancelButtonText: vm.$t('cancel'),
          type: 'warning'
        }).then(function () {
          vm.$http.put('/sys/schedule/run', id ? [id] : vm.dataListSelections.map(function (item) { return item.id; })).then(function (res) {
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
      // 日志列表
      logHandle: function () {
        vm.logVisible = true;
        vm.$nextTick(function () {
          vm.$refs.log.init();
        });
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
          <el-form-item prop="beanName" :label="$t(\'schedule.beanName\')">\
            <el-input v-model="dataForm.beanName" :placeholder="$t(\'schedule.beanNameTips\')"></el-input>\
          </el-form-item>\
          <el-form-item prop="params" :label="$t(\'schedule.params\')">\
            <el-input v-model="dataForm.params" :placeholder="$t(\'schedule.params\')"></el-input>\
          </el-form-item>\
          <el-form-item prop="cronExpression" :label="$t(\'schedule.cronExpression\')">\
            <el-input v-model="dataForm.cronExpression" :placeholder="$t(\'schedule.cronExpressionTips\')"></el-input>\
          </el-form-item>\
          <el-form-item prop="remark"  :label="$t(\'schedule.remark\')">\
            <el-input v-model="dataForm.remark" :placeholder="$t(\'schedule.remark\')"></el-input>\
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
          beanName: '',
          params: '',
          cronExpression: '',
          remark: '',
          status: 0
        }
      }
    },
    computed: {
      dataRule: function () {
        return {
          beanName: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' }
          ],
          cronExpression: [
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
        self.$http.get('/sys/schedule/' + self.dataForm.id).then(function (res) {
          if (res.data.code !== 0) {
            return self.$message.error(res.data.msg);
          }
          self.dataForm = res.data.data;
        }).catch(function () {});
      },
      // 表单提交
      dataFormSubmitHandle: _.debounce(function () {
        self.$refs['dataForm'].validate(function (valid) {
          if (!valid) {
            return false;
          }
          self.$http[!self.dataForm.id ? 'post' : 'put']('/sys/schedule', self.dataForm).then(function (res) {
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

/**
 * log组件
 */
function fnLogComponent () {
  var self = null;
  return {
    template: '\
      <el-dialog :visible.sync="visible" :title="$t(\'schedule.log\')" :close-on-click-modal="false" :close-on-press-escape="false" :fullscreen="true">\
        <el-form :inline="true" :model="dataForm" @keyup.enter.native="getDataList()">\
          <el-form-item>\
            <el-input v-model="dataForm.jobId" :placeholder="$t(\'schedule.jobId\')" clearable></el-input>\
          </el-form-item>\
          <el-form-item>\
            <el-button @click="getDataList()">{{ $t(\'query\') }}</el-button>\
          </el-form-item>\
        </el-form>\
        <el-table\
          v-loading="dataListLoading"\
          :data="dataList"\
          border\
          @sort-change="dataListSortChangeHandle"\
          height="460"\
          style="width: 100%;">\
          <el-table-column prop="jobId" :label="$t(\'schedule.jobId\')" header-align="center" align="center"></el-table-column>\
          <el-table-column prop="beanName" :label="$t(\'schedule.beanName\')" header-align="center" align="center"></el-table-column>\
          <el-table-column prop="params" :label="$t(\'schedule.params\')" header-align="center" align="center"></el-table-column>\
          <el-table-column prop="status" :label="$t(\'schedule.status\')" header-align="center" align="center">\
            <template slot-scope="scope">\
              <el-tag v-if="scope.row.status === 1" size="small">{{ $t(\'schedule.statusLog1\') }}</el-tag>\
              <el-tag v-else type="danger" size="small" @click.native="showErrorInfo(scope.row.id)" style="cursor: pointer;">{{ $t(\'schedule.statusLog0\') }}</el-tag>\
            </template>\
          </el-table-column>\
          <el-table-column prop="times" :label="$t(\'schedule.times\')" header-align="center" align="center"></el-table-column>\
          <el-table-column prop="createDate" :label="$t(\'schedule.createDate\')" header-align="center" align="center" width="180"></el-table-column>\
        </el-table>\
        <el-pagination\
          :current-page="page"\
          :page-sizes="[10, 20, 50, 100]"\
          :page-size="limit"\
          :total="total"\
          layout="total, sizes, prev, pager, next, jumper"\
          @size-change="pageSizeChangeHandle"\
          @current-change="pageCurrentChangeHandle">\
        </el-pagination>\
      </el-dialog>\
    ',
    mixins: [window.SITE_CONFIG.mixinViewModule],
    data: function () {
      return {
        visible: false,
        mixinViewModuleOptions: {
          getDataListURL: '/sys/scheduleLog/page',
          getDataListIsPage: true
        },
        dataForm: {
          jobId: ''
        }
      }
    },
    beforeCreate: function () {
      self = this;
    },
    methods: {
      init: function () {
        self.visible = true;
        self.getDataList();
      },
      // 失败信息
      showErrorInfo: function (id) {
        self.$http.get('/sys/scheduleLog/' + id).then(function (res) {
          if (res.data.code !== 0) {
            return self.$message.error(res.data.msg);
          }
          self.$alert(res.data.data.error, vm.$t('logError.errorInfo'), {
            customClass: 'mod-job__schedule-view-info'
          });
        }).catch(function () {});
      }
    }
  }
};
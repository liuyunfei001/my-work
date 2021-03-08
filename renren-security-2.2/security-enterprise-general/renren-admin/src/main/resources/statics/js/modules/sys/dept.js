(function () {
  var vm = window.vm = new Vue({
    el: '.aui-wrapper',
    i18n: window.SITE_CONFIG.i18n,
    mixins: [window.SITE_CONFIG.mixinViewModule],
    data: function () {
      return {
        mixinViewModuleOptions: {
          getDataListURL: '/sys/dept/list',
          deleteURL: '/sys/dept'
        }
      }
    },
    components: {
      'add-or-update': fnAddOrUpdateComponent()
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
          <el-form-item prop="name" :label="$t(\'dept.name\')">\
            <el-input v-model="dataForm.name" :placeholder="$t(\'dept.name\')"></el-input>\
          </el-form-item>\
          <el-form-item prop="parentName" :label="$t(\'dept.parentName\')" class="dept-list">\
            <el-popover v-model="deptListVisible" ref="deptListPopover" placement="bottom-start" trigger="click">\
              <el-tree\
                :data="deptList"\
                :props="{ label: \'name\', children: \'children\' }"\
                node-key="id"\
                ref="deptListTree"\
                :highlight-current="true"\
                :expand-on-click-node="false"\
                accordion\
                @current-change="deptListTreeCurrentChangeHandle">\
              </el-tree>\
            </el-popover>\
            <el-input v-model="dataForm.parentName" v-popover:deptListPopover :readonly="true" :placeholder="$t(\'dept.parentName\')">\
              <i\
                v-if="superAdmin === 1 && dataForm.pid !== \'0\'"\
                slot="suffix"\
                @click.stop="deptListTreeSetDefaultHandle()"\
                class="el-icon-circle-close el-input__icon">\
              </i>\
            </el-input>\
          </el-form-item>\
          <el-form-item prop="sort" :label="$t(\'dept.sort\')">\
            <el-input-number v-model="dataForm.sort" controls-position="right" :min="0" :label="$t(\'dept.sort\')"></el-input-number>\
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
        deptList: [],
        deptListVisible: false,
        dataForm: {
          id: '',
          name: '',
          pid: '',
          parentName: '',
          sort: 0
        }
      }
    },
    computed: {
      superAdmin: function () {
        return window.parent.vm.user.superAdmin;
      },
      dataRule: function () {
        return {
          name: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' }
          ],
          parentName: [
            { required: true, message: self.$t('validate.required'), trigger: 'change' }
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
          self.getDeptList().then(function () {
            if (self.dataForm.id) {
              self.getInfo();
            } else if (self.superAdmin === 1) {
              self.deptListTreeSetDefaultHandle();
            }
          });
        });
      },
      // 获取部门列表
      getDeptList: function () {
        return self.$http.get('/sys/dept/list').then(function (res) {
          if (res.data.code !== 0) {
            return self.$message.error(res.data.msg);
          }
          self.deptList = res.data.data;
        }).catch(function () {});
      },
      // 获取信息
      getInfo: function () {
        self.$http.get('/sys/dept/' + self.dataForm.id).then(function (res) {
          if (res.data.code !== 0) {
            return self.$message.error(res.data.msg);
          }
          self.dataForm = _.merge({}, self.dataForm, res.data.data);
          if (self.dataForm.pid === '0') {
            return self.deptListTreeSetDefaultHandle();
          }
          self.$refs.deptListTree.setCurrentKey(self.dataForm.pid);
        }).catch(function () {});
      },
      // 上级部门树, 设置默认值
      deptListTreeSetDefaultHandle: function () {
        self.dataForm.pid = '0';
        self.dataForm.parentName = self.$t('dept.parentNameDefault');
      },
      // 上级部门树, 选中
      deptListTreeCurrentChangeHandle: function (data) {
        self.dataForm.pid = data.id;
        self.dataForm.parentName = data.name;
        self.deptListVisible = false;
      },
      // 表单提交
      dataFormSubmitHandle: _.debounce(function () {
        self.$refs['dataForm'].validate(function (valid) {
          if (!valid) {
            return false;
          }
          self.$http[!self.dataForm.id ? 'post' : 'put']('/sys/dept', self.dataForm).then(function (res) {
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
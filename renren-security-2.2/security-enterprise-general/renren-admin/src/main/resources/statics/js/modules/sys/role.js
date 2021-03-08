(function () {
  var vm = window.vm = new Vue({
    el: '.aui-wrapper',
    i18n: window.SITE_CONFIG.i18n,
    mixins: [window.SITE_CONFIG.mixinViewModule],
    data: function () {
      return {
        mixinViewModuleOptions: {
          getDataListURL: '/sys/role/page',
          getDataListIsPage: true,
          deleteURL: '/sys/role',
          deleteIsBatch: true
        },
        dataForm: {
          name: ''
        }
      }
    },
    components: {
      'add-or-update': fnAddOrUpdateComponent()
    },
    beforeCreate: function () {
      vm = this;
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
          <el-form-item prop="name" :label="$t(\'role.name\')">\
            <el-input v-model="dataForm.name" :placeholder="$t(\'role.name\')"></el-input>\
          </el-form-item>\
          <el-form-item prop="remark" :label="$t(\'role.remark\')">\
            <el-input v-model="dataForm.remark" :placeholder="$t(\'role.remark\')"></el-input>\
          </el-form-item>\
          <el-row>\
            <el-col :span="12">\
              <el-form-item size="mini" :label="$t(\'role.menuList\')">\
                <el-tree\
                  :data="menuList"\
                  :props="{ label: \'name\', children: \'children\' }"\
                  node-key="id"\
                  ref="menuListTree"\
                  accordion\
                  show-checkbox>\
                </el-tree>\
              </el-form-item>\
            </el-col>\
            <el-col :span="12">\
              <el-form-item size="mini" :label="$t(\'role.deptList\')">\
                <el-tree\
                  :data="deptList"\
                  :props="{ label: \'name\', children: \'children\' }"\
                  node-key="id"\
                  ref="deptListTree"\
                  accordion\
                  show-checkbox>\
                </el-tree>\
              </el-form-item>\
            </el-col>\
          </el-row>\
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
        menuList: [],
        deptList: [],
        dataForm: {
          id: '',
          name: '',
          menuIdList: [],
          deptIdList: [],
          remark: ''
        }
      }
    },
    computed: {
      dataRule: function () {
        return {
          name: [
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
          self.$refs.menuListTree.setCheckedKeys([]);
          self.$refs.deptListTree.setCheckedKeys([]);
          Promise.all([
            self.getMenuList(),
            self.getDeptList()
          ]).then(function () {
            if (self.dataForm.id) {
              self.getInfo();
            }
          });
        });
      },
      // 获取菜单列表
      getMenuList: function () {
        return self.$http.get('/sys/menu/select').then(function (res) {
          if (res.data.code !== 0) {
            return self.$message.error(res.data.msg);
          }
          self.menuList = res.data.data;
        }).catch(function () {});
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
        self.$http.get('/sys/role/' + self.dataForm.id).then(function (res) {
          if (res.data.code !== 0) {
            return self.$message.error(res.data.msg);
          }
          self.dataForm = _.assignIn({}, self.dataForm, res.data.data);
          self.dataForm.menuIdList.forEach(function (item) { self.$refs.menuListTree.setChecked(item, true); });
          self.$refs.deptListTree.setCheckedKeys(self.dataForm.deptIdList);
        }).catch(function () {});
      },
      // 表单提交
      dataFormSubmitHandle: _.debounce(function () {
        self.$refs['dataForm'].validate(function (valid) {
          if (!valid) {
            return false;
          }
          self.dataForm.menuIdList = self.$refs.menuListTree.getHalfCheckedKeys().concat(self.$refs.menuListTree.getCheckedKeys());
          self.dataForm.deptIdList = self.$refs.deptListTree.getCheckedKeys()
          self.$http[!self.dataForm.id ? 'post' : 'put']('/sys/role', self.dataForm).then(function (res) {
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
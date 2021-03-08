(function () {
  var vm = window.vm = new Vue({
    el: '.aui-wrapper',
    i18n: window.SITE_CONFIG.i18n,
    mixins: [window.SITE_CONFIG.mixinViewModule],
    data: function () {
      return {
        mixinViewModuleOptions: {
          getDataListURL: '/sys/user/page',
          getDataListIsPage: true,
          deleteURL: '/sys/user',
          deleteIsBatch: true,
          exportURL: '/sys/user/export'
        },
        dataForm: {
          username: ''
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
          <el-form-item prop="username" :label="$t(\'user.username\')">\
            <el-input v-model="dataForm.username" :placeholder="$t(\'user.username\')"></el-input>\
          </el-form-item>\
          <el-form-item prop="deptName" :label="$t(\'user.deptName\')" class="dept-list">\
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
            <el-input v-model="dataForm.deptName" v-popover:deptListPopover :readonly="true" :placeholder="$t(\'user.deptName\')"></el-input>\
          </el-form-item>\
          <el-form-item prop="password" :label="$t(\'user.password\')" :class="{ \'is-required\': !dataForm.id }">\
            <el-input v-model="dataForm.password" type="password" :placeholder="$t(\'user.password\')"></el-input>\
          </el-form-item>\
          <el-form-item prop="comfirmPassword" :label="$t(\'user.comfirmPassword\')" :class="{ \'is-required\': !dataForm.id }">\
            <el-input v-model="dataForm.comfirmPassword" type="password" :placeholder="$t(\'user.comfirmPassword\')"></el-input>\
          </el-form-item>\
          <el-form-item prop="realName" :label="$t(\'user.realName\')">\
            <el-input v-model="dataForm.realName" :placeholder="$t(\'user.realName\')"></el-input>\
          </el-form-item>\
          <el-form-item prop="gender" :label="$t(\'user.gender\')" size="mini">\
            <el-radio-group v-model="dataForm.gender">\
              <el-radio :label="0">{{ $t(\'user.gender0\') }}</el-radio>\
              <el-radio :label="1">{{ $t(\'user.gender1\') }}</el-radio>\
              <el-radio :label="2">{{ $t(\'user.gender2\') }}</el-radio>\
            </el-radio-group>\
          </el-form-item>\
          <el-form-item prop="email" :label="$t(\'user.email\')">\
            <el-input v-model="dataForm.email" :placeholder="$t(\'user.email\')"></el-input>\
          </el-form-item>\
          <el-form-item prop="mobile" :label="$t(\'user.mobile\')">\
            <el-input v-model="dataForm.mobile" :placeholder="$t(\'user.mobile\')"></el-input>\
          </el-form-item>\
          <el-form-item prop="roleIdList" :label="$t(\'user.roleIdList\')" class="role-list">\
            <el-select v-model="dataForm.roleIdList" multiple :placeholder="$t(\'user.roleIdList\')">\
              <el-option v-for="role in roleList" :key="role.id" :label="role.name" :value="role.id"></el-option>\
            </el-select>\
          </el-form-item>\
          <el-form-item prop="status" :label="$t(\'user.status\')" size="mini">\
            <el-radio-group v-model="dataForm.status">\
              <el-radio :label="0">{{ $t(\'user.status0\') }}</el-radio>\
              <el-radio :label="1">{{ $t(\'user.status1\') }}</el-radio>\
            </el-radio-group>\
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
        roleList: [],
        roleIdListDefault: [],
        dataForm: {
          id: '',
          username: '',
          deptId: '0',
          deptName: '',
          password: '',
          comfirmPassword: '',
          realName: '',
          gender: 0,
          email: '',
          mobile: '',
          roleIdList: [],
          status: 1
        }
      }
    },
    computed: {
      dataRule: function () {
        var validatePassword = function (rule, value, callback) {
          if (!self.dataForm.id && !/\S/.test(value)) {
            return callback(new Error(self.$t('validate.required')));
          }
          callback();
        }
        var validateComfirmPassword = function (rule, value, callback) {
          if (!self.dataForm.id && !/\S/.test(value)) {
            return callback(new Error(self.$t('validate.required')));
          }
          if (self.dataForm.password !== value) {
            return callback(new Error(self.$t('user.validate.comfirmPassword')));
          }
          callback();
        }
        var validateEmail = function (rule, value, callback) {
          if (!self.$validate.isEmail(value)) {
            return callback(new Error(self.$t('validate.format', { 'attr': self.$t('user.email') })));
          }
          callback();
        }
        var validateMobile = function (rule, value, callback) {
          if (!self.$validate.isMobile(value)) {
            return callback(new Error(self.$t('validate.format', { 'attr': self.$t('user.mobile') })));
          }
          callback();
        }
        return {
          username: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' }
          ],
          deptName: [
            { required: true, message: self.$t('validate.required'), trigger: 'change' }
          ],
          password: [
            { validator: validatePassword, trigger: 'blur' }
          ],
          comfirmPassword: [
            { validator: validateComfirmPassword, trigger: 'blur' }
          ],
          realName: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' }
          ],
          email: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' },
            { validator: validateEmail, trigger: 'blur' }
          ],
          mobile: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' },
            { validator: validateMobile, trigger: 'blur' }
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
          self.roleIdListDefault = [];
          Promise.all([
            self.getDeptList(),
            self.getRoleList()
          ]).then(function () {
            if (self.dataForm.id) {
              self.getInfo();
            }
          })
        })
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
      // 获取角色列表
      getRoleList: function () {
        return self.$http.get('/sys/role/list').then(function (res) {
          if (res.data.code !== 0) {
            return self.$message.error(res.data.msg);
          }
          self.roleList = res.data.data;
        }).catch(function () {});
      },
      // 获取信息
      getInfo: function () {
        self.$http.get('/sys/user/' + self.dataForm.id).then(function (res) {
          if (res.data.code !== 0) {
            return self.$message.error(res.data.msg);
          }
          self.dataForm = _.assignIn({}, self.dataForm, res.data.data);
          self.dataForm.roleIdList = [];
          self.$refs.deptListTree.setCurrentKey(self.dataForm.deptId);
          // 角色配置, 区分是否为默认角色
          for (var i = 0; i < res.data.data.roleIdList.length; i++) {
            if (self.roleList.filter(function (item) { return item.id === res.data.data.roleIdList[i]; })[0]) {
              self.dataForm.roleIdList.push(res.data.data.roleIdList[i]);
              continue;
            }
            self.roleIdListDefault.push(res.data.data.roleIdList[i]);
          }
        }).catch(function () {});
      },
      // 所属部门树, 选中
      deptListTreeCurrentChangeHandle: function (data, node) {
        self.dataForm.deptId = data.id;
        self.dataForm.deptName = data.name;
        self.deptListVisible = false;
      },
      // 表单提交
      dataFormSubmitHandle: _.debounce(function () {
        self.$refs['dataForm'].validate(function (valid) {
          if (!valid) {
            return false;
          }
          self.$http[!self.dataForm.id ? 'post' : 'put']('/sys/user', _.merge(
            {}, self.dataForm, { roleIdList: self.roleIdListDefault.concat(self.dataForm.roleIdList)}
          )).then(function (res) {
            if (res.data.code !== 0) {
              return self.$message.error(res.data.msg);
            }
            self.$message({
              message: self.$t('prompt.success'),
              type: 'success',
              duration: 500,
              onClose: function () {
                self.visible = false
                self.$emit('refresh-data-list')
              }
            })
          }).catch(function () {});
        })
      }, 1000, { 'leading': true, 'trailing': false })
    }
  }
};
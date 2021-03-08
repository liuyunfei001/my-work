(function () {
  var vm = window.vm = new Vue({
    el: '.aui-wrapper',
    i18n: window.SITE_CONFIG.i18n,
    mixins: [window.SITE_CONFIG.mixinViewModule],
    data: function () {
      return {
        mixinViewModuleOptions: {
          getDataListURL: '/sys/menu/list',
          deleteURL: '/sys/menu'
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
          <el-form-item prop="type" :label="$t(\'menu.type\')" size="mini">\
            <el-radio-group v-model="dataForm.type" :disabled="!!dataForm.id">\
              <el-radio :label="0">{{ $t(\'menu.type0\') }}</el-radio>\
              <el-radio :label="1">{{ $t(\'menu.type1\') }}</el-radio>\
            </el-radio-group>\
          </el-form-item>\
          <el-form-item prop="name" :label="$t(\'menu.name\')">\
            <el-input v-model="dataForm.name" :placeholder="$t(\'menu.name\')"></el-input>\
          </el-form-item>\
          <el-form-item prop="parentName" :label="$t(\'menu.parentName\')" class="menu-list">\
            <el-popover v-model="menuListVisible" ref="menuListPopover" placement="bottom-start" trigger="click">\
              <el-tree\
                :data="menuList"\
                :props="{ label: \'name\', children: \'children\' }"\
                node-key="id"\
                ref="menuListTree"\
                :highlight-current="true"\
                :expand-on-click-node="false"\
                accordion\
                @current-change="menuListTreeCurrentChangeHandle">\
              </el-tree>\
            </el-popover>\
            <el-input v-model="dataForm.parentName" v-popover:menuListPopover :readonly="true" :placeholder="$t(\'menu.parentName\')">\
              <i v-if="dataForm.pid !== \'0\'" slot="suffix" @click.stop="deptListTreeSetDefaultHandle()" class="el-icon-circle-close el-input__icon"></i>\
            </el-input>\
          </el-form-item>\
          <el-form-item v-if="dataForm.type === 0" prop="url" :label="$t(\'menu.url\')">\
            <el-input v-model="dataForm.url" :placeholder="$t(\'menu.url\')"></el-input>\
          </el-form-item>\
          <el-form-item prop="sort" :label="$t(\'menu.sort\')">\
            <el-input-number v-model="dataForm.sort" controls-position="right" :min="0" :label="$t(\'menu.sort\')"></el-input-number>\
          </el-form-item>\
          <el-form-item prop="permissions" :label="$t(\'menu.permissions\')">\
            <el-input v-model="dataForm.permissions" :placeholder="$t(\'menu.permissionsTips\')"></el-input>\
          </el-form-item>\
          <el-form-item v-if="dataForm.type === 0" prop="icon" :label="$t(\'menu.icon\')" class="icon-list">\
            <el-popover v-model="iconListVisible" ref="iconListPopover" placement="bottom-start" trigger="click" popper-class="mod-sys__menu-icon-popover">\
              <div class="mod-sys__menu-icon-inner">\
                <div class="mod-sys__menu-icon-list">\
                  <el-button\
                    v-for="(item, index) in iconList"\
                    :key="index"\
                    @click="iconListCurrentChangeHandle(item)"\
                    :class="{ \'is-active\': dataForm.icon === item }">\
                    <svg class="icon-svg" aria-hidden="true"><use :xlink:href="\'#\' + item"></use></svg>\
                  </el-button>\
                </div>\
              </div>\
            </el-popover>\
            <el-input v-model="dataForm.icon" v-popover:iconListPopover :readonly="true" :placeholder="$t(\'menu.icon\')"></el-input>\
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
        menuList: [],
        menuListVisible: false,
        iconList: [],
        iconListVisible: false,
        dataForm: {
          id: '',
          type: 0,
          name: '',
          pid: '0',
          parentName: '',
          url: '',
          permissions: '',
          sort: 0,
          icon: ''
        }
      }
    },
    computed: {
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
    watch: {
      'dataForm.type': function (val) {
        self.$refs['dataForm'].clearValidate();
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
          self.iconList = self.$utils.getIconList();
          self.dataForm.parentName = self.$t('menu.parentNameDefault');
          self.getMenuList().then(function () {
            if (self.dataForm.id) {
              self.getInfo();
            }
          });
        });
      },
      // 获取菜单列表
      getMenuList: function () {
        return self.$http.get('/sys/menu/list?type=0').then(function (res) {
          if (res.data.code !== 0) {
            return self.$message.error(res.data.msg);
          }
          self.menuList = res.data.data;
        }).catch(function () {});
      },
      // 获取信息
      getInfo: function () {
        self.$http.get('/sys/menu/' + self.dataForm.id).then(function (res) {
          if (res.data.code !== 0) {
            return self.$message.error(res.data.msg);
          }
          self.dataForm = _.merge({}, self.dataForm, res.data.data);
          if (self.dataForm.pid === '0') {
            return self.deptListTreeSetDefaultHandle();
          }
          self.$refs.menuListTree.setCurrentKey(self.dataForm.pid);
        }).catch(function () {});
      },
      // 上级菜单树, 设置默认值
      deptListTreeSetDefaultHandle: function () {
        self.dataForm.pid = '0';
        self.dataForm.parentName = self.$t('menu.parentNameDefault');
      },
      // 上级菜单树, 选中
      menuListTreeCurrentChangeHandle: function (data) {
        self.dataForm.pid = data.id;
        self.dataForm.parentName = data.name;
        self.menuListVisible = false;
      },
      // 图标, 选中
      iconListCurrentChangeHandle: function (icon) {
        self.dataForm.icon = icon;
        self.iconListVisible = false;
      },
      // 表单提交
      dataFormSubmitHandle: _.debounce(function () {
        self.$refs['dataForm'].validate(function (valid) {
          if (!valid) {
            return false;
          }
          self.$http[!self.dataForm.id ? 'post' : 'put']('/sys/menu', self.dataForm).then(function (res) {
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
            })
          }).catch(function () {});
        });
      }, 1000, { 'leading': true, 'trailing': false })
    }
  }
};
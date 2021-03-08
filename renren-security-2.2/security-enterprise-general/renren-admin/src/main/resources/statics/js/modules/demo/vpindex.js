(function () {
  var vm = window.vm = new Vue({
    el: '.aui-wrapper',
    i18n: window.SITE_CONFIG.i18n,
    mixins: [window.SITE_CONFIG.mixinViewModule],
    data: function () {
      return {
        mixinViewModuleOptions: {
          getDataListURL: '/demo/vpindex/page',
          getDataListIsPage: true,
          exportURL: '/demo/vpindex/export',
          deleteURL: '/demo/vpindex',
          deleteIsBatch: true
        },
        dataForm: {
          id: ''
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
          <el-form-item label="姓名" prop="vpName">\
            <el-input v-model="dataForm.vpName" placeholder="姓名"></el-input>\
          </el-form-item>\
          <el-form-item label="性别" prop="vpSex">\
            <el-input v-model="dataForm.vpSex" placeholder="性别"></el-input>\
          </el-form-item>\
          <el-form-item label="身高" prop="vpHeight">\
            <el-input v-model="dataForm.vpHeight" placeholder="身高"></el-input>\
          </el-form-item>\
          <el-form-item label="手机" prop="vpPhone">\
            <el-input v-model="dataForm.vpPhone" placeholder="手机"></el-input>\
          </el-form-item>\
          <el-form-item label="身份证号" prop="vpId">\
            <el-input v-model="dataForm.vpId" placeholder="身份证号"></el-input>\
          </el-form-item>\
          <el-form-item label="体重" prop="vpWeight">\
            <el-input v-model="dataForm.vpWeight" placeholder="体重"></el-input>\
          </el-form-item>\
          <el-form-item label="年龄" prop="vpAge">\
            <el-input v-model="dataForm.vpAge" placeholder="年龄"></el-input>\
          </el-form-item>\
          <el-form-item label="地址" prop="vpAddress">\
            <el-input v-model="dataForm.vpAddress" placeholder="地址"></el-input>\
          </el-form-item>\
          <el-form-item label="需求" prop="vpNeed">\
            <el-input v-model="dataForm.vpNeed" placeholder="需求"></el-input>\
          </el-form-item>\
          <el-form-item label="备注" prop="vpRemarks">\
            <el-input v-model="dataForm.vpRemarks" placeholder="备注"></el-input>\
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
          vpName: '',
          vpSex: '',
          vpHeight: '',
          vpPhone: '',
          vpId: '',
          vpWeight: '',
          vpAge: '',
          vpAddress: '',
          vpNeed: '',
          vpRemarks: '',
          id: ''
        }
      }
    },
    computed: {
      dataRule: function () {
        return {
          vpName: [
            { required: true, message: this.$t('validate.required'), trigger: 'blur' }
          ],
          vpSex: [
            { required: true, message: this.$t('validate.required'), trigger: 'blur' }
          ],
          vpHeight: [
            { required: true, message: this.$t('validate.required'), trigger: 'blur' }
          ],
          vpPhone: [
            { required: true, message: this.$t('validate.required'), trigger: 'blur' }
          ],
          vpId: [
            { required: true, message: this.$t('validate.required'), trigger: 'blur' }
          ],
          vpWeight: [
            { required: true, message: this.$t('validate.required'), trigger: 'blur' }
          ],
          vpAge: [
            { required: true, message: this.$t('validate.required'), trigger: 'blur' }
          ],
          vpAddress: [
            { required: true, message: this.$t('validate.required'), trigger: 'blur' }
          ],
          vpNeed: [
            { required: true, message: this.$t('validate.required'), trigger: 'blur' }
          ],
          vpRemarks: [
            { required: true, message: this.$t('validate.required'), trigger: 'blur' }
          ],
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
        self.$http.get('/demo/vpindex/' + self.dataForm.id).then(function (res) {
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
          self.$http[!self.dataForm.id ? 'post' : 'put']('/demo/vpindex', self.dataForm).then(function (res) {
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
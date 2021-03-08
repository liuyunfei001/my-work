(function () {
  var vm = window.vm = new Vue({
    el: '.aui-wrapper',
    i18n: window.SITE_CONFIG.i18n,
    mixins: [window.SITE_CONFIG.mixinViewModule],
    data: function () {
      return {
        mixinViewModuleOptions: {
          getDataListURL: '/demo/vpceindex/page',
          getDataListIsPage: true,
          exportURL: '/demo/vpceindex/export',
          deleteURL: '/demo/vpceindex',
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
          <el-form-item label="所属用户主键" prop="vpId">\
            <el-input v-model="dataForm.vpId" placeholder="所属用户主键"></el-input>\
          </el-form-item>\
          <el-form-item label="测试日期" prop="testDate">\
            <el-input v-model="dataForm.testDate" placeholder="测试日期"></el-input>\
          </el-form-item>\
          <el-form-item label="测试体重" prop="vpWeight">\
            <el-input v-model="dataForm.vpWeight" placeholder="测试体重"></el-input>\
          </el-form-item>\
          <el-form-item label="脂肪率" prop="vpTzl">\
            <el-input v-model="dataForm.vpTzl" placeholder="脂肪率"></el-input>\
          </el-form-item>\
          <el-form-item label="水分比率" prop="vpSf">\
            <el-input v-model="dataForm.vpSf" placeholder="水分比率"></el-input>\
          </el-form-item>\
          <el-form-item label="肌肉量" prop="vpJrl">\
            <el-input v-model="dataForm.vpJrl" placeholder="肌肉量"></el-input>\
          </el-form-item>\
          <el-form-item label="骨量钙" prop="vpGlg">\
            <el-input v-model="dataForm.vpGlg" placeholder="骨量钙"></el-input>\
          </el-form-item>\
          <el-form-item label="体形" prop="vpTx">\
            <el-input v-model="dataForm.vpTx" placeholder="体形"></el-input>\
          </el-form-item>\
          <el-form-item label="基础代谢" prop="vpDxz">\
            <el-input v-model="dataForm.vpDxz" placeholder="基础代谢"></el-input>\
          </el-form-item>\
          <el-form-item label="代谢年龄" prop="vpDxage">\
            <el-input v-model="dataForm.vpDxage" placeholder="代谢年龄"></el-input>\
          </el-form-item>\
          <el-form-item label="体重指数" prop="vpBmi">\
            <el-input v-model="dataForm.vpBmi" placeholder="体重指数"></el-input>\
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
          vpId: '',
          testDate: '',
          vpWeight: '',
          vpTzl: '',
          vpSf: '',
          vpJrl: '',
          vpGlg: '',
          vpTx: '',
          vpDxz: '',
          vpDxage: '',
          vpBmi: ''
        }
      }
    },
    computed: {
      dataRule: function () {
        return {
          vpId: [
            { required: true, message: this.$t('validate.required'), trigger: 'blur' }
          ],
          testDate: [
            { required: true, message: this.$t('validate.required'), trigger: 'blur' }
          ],
          vpWeight: [
            { required: true, message: this.$t('validate.required'), trigger: 'blur' }
          ],
          vpTzl: [
            { required: true, message: this.$t('validate.required'), trigger: 'blur' }
          ],
          vpSf: [
            { required: true, message: this.$t('validate.required'), trigger: 'blur' }
          ],
          vpJrl: [
            { required: true, message: this.$t('validate.required'), trigger: 'blur' }
          ],
          vpGlg: [
            { required: true, message: this.$t('validate.required'), trigger: 'blur' }
          ],
          vpTx: [
            { required: true, message: this.$t('validate.required'), trigger: 'blur' }
          ],
          vpDxz: [
            { required: true, message: this.$t('validate.required'), trigger: 'blur' }
          ],
          vpDxage: [
            { required: true, message: this.$t('validate.required'), trigger: 'blur' }
          ],
          vpBmi: [
            { required: true, message: this.$t('validate.required'), trigger: 'blur' }
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
        self.$http.get('/demo/vpceindex/' + self.dataForm.id).then(function (res) {
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
          self.$http[!self.dataForm.id ? 'post' : 'put']('/demo/vpceindex', self.dataForm).then(function (res) {
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
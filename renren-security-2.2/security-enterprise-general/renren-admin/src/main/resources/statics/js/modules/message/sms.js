(function () {
  var vm = window.vm = new Vue({
    el: '.aui-wrapper',
    i18n: window.SITE_CONFIG.i18n,
    mixins: [window.SITE_CONFIG.mixinViewModule],
    data: function () {
      return {
        mixinViewModuleOptions: {
          getDataListURL: '/sys/sms/page',
          getDataListIsPage: true,
          deleteURL: '/sys/sms',
          deleteIsBatch: true
        },
        dataForm: {
          mobile: '',
          status: null
        },
        configVisible: false,
        sendVisible: false
      }
    },
    components: {
      'config': fnConfigComponent(),
      'send': fnSendComponent()
    },
    beforeCreate: function () {
      vm = this;
    },
    methods: {
      // 短信配置
      configHandle: function () {
        vm.configVisible = true;
        vm.$nextTick(function () {
          vm.$refs.config.init();
        });
      },
      // 发送短信
      sendHandle: function () {
        vm.sendVisible = true;
        vm.$nextTick(function () {
          vm.$refs.send.init();
        });
      }
    }
  });
})();

/**
 * config组件
 */
function fnConfigComponent () {
  var self = null;
  return {
    template: '\
      <el-dialog :visible.sync="visible" :title="$t(\'sms.config\')" :close-on-click-modal="false" :close-on-press-escape="false" :fullscreen="true">\
        <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmitHandle()" label-width="120px">\
          <el-form-item :label="$t(\'sms.platform\')" size="mini">\
            <el-radio-group v-model="dataForm.platform">\
              <el-radio :label="1">{{ $t(\'sms.platform1\') }}</el-radio>\
              <el-radio :label="2">{{ $t(\'sms.platform2\') }}</el-radio>\
            </el-radio-group>\
          </el-form-item>\
          <template v-if="dataForm.platform === 1">\
            <el-form-item prop="aliyunAccessKeyId" :label="$t(\'sms.aliyunAccessKeyId\')">\
              <el-input v-model="dataForm.aliyunAccessKeyId" :placeholder="$t(\'sms.aliyunAccessKeyIdTips\')"></el-input>\
            </el-form-item>\
            <el-form-item prop="aliyunAccessKeySecret" :label="$t(\'sms.aliyunAccessKeySecret\')">\
              <el-input v-model="dataForm.aliyunAccessKeySecret" :placeholder="$t(\'sms.aliyunAccessKeySecretTips\')"></el-input>\
            </el-form-item>\
            <el-form-item prop="aliyunSignName" :label="$t(\'sms.aliyunSignName\')">\
              <el-input v-model="dataForm.aliyunSignName" :placeholder="$t(\'sms.aliyunSignName\')"></el-input>\
            </el-form-item>\
            <el-form-item prop="aliyunTemplateCode" :label="$t(\'sms.aliyunTemplateCode\')">\
              <el-input v-model="dataForm.aliyunTemplateCode" :placeholder="$t(\'sms.aliyunTemplateCodeTips\')"></el-input>\
            </el-form-item>\
          </template>\
          <template v-else-if="dataForm.platform === 2">\
            <el-form-item prop="qcloudAppId" :label="$t(\'sms.qcloudAppId\')">\
              <el-input v-model="dataForm.qcloudAppId" :placeholder="$t(\'sms.qcloudAppIdTips\')"></el-input>\
            </el-form-item>\
            <el-form-item prop="qcloudAppKey" :label="$t(\'sms.qcloudAppKey\')">\
              <el-input v-model="dataForm.qcloudAppKey" :placeholder="$t(\'sms.qcloudAppKeyTips\')"></el-input>\
            </el-form-item>\
            <el-form-item prop="qcloudSignName" :label="$t(\'sms.qcloudSignName\')">\
              <el-input v-model="dataForm.qcloudSignName" :placeholder="$t(\'sms.qcloudSignName\')"></el-input>\
            </el-form-item>\
            <el-form-item prop="qcloudTemplateId" :label="$t(\'sms.qcloudTemplateId\')">\
              <el-input v-model="dataForm.qcloudTemplateId" :placeholder="$t(\'sms.qcloudTemplateIdTips\')"></el-input>\
            </el-form-item>\
          </template>\
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
          platform: 0,
          aliyunAccessKeyId: '',
          aliyunAccessKeySecret: '',
          aliyunSignName: '',
          aliyunTemplateCode: '',
          qcloudAppId: 0,
          qcloudAppKey: '',
          qcloudSignName: '',
          qcloudTemplateId: ''
        }
      }
    },
    computed: {
      dataRule: function () {
        return {
          aliyunAccessKeyId: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' }
          ],
          aliyunAccessKeySecret: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' }
          ],
          aliyunSignName: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' }
          ],
          aliyunTemplateCode: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' }
          ],
          qcloudAppId: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' }
          ],
          qcloudAppKey: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' }
          ],
          qcloudSignName: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' }
          ],
          qcloudTemplateId: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' }
          ]
        }
      }
    },
    watch: {
      'dataForm.platform': function (val) {
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
          self.getInfo();
        });
      },
      // 获取信息
      getInfo: function () {
        self.$http.get('/sys/sms/config').then(function (res) {
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
          self.$http.post('/sys/sms/saveConfig', self.dataForm).then(function (res) {
            if (res.data.code !== 0) {
              return self.$message.error(res.data.msg);
            }
            self.$message({
              message: self.$t('prompt.success'),
              type: 'success',
              duration: 500,
              onClose: function () {
                self.visible = false;
                self.$emit('refreshDataList');
              }
            });
          }).catch(function () {});
        });
      }, 1000, { 'leading': true, 'trailing': false })
    }
  }
};

/**
 * send组件
 */
function fnSendComponent () {
  var self = null;
  return {
    template: '\
      <el-dialog :visible.sync="visible" :title="$t(\'sms.send\')" :close-on-click-modal="false" :close-on-press-escape="false" :fullscreen="true">\
        <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmitHandle()" label-width="120px">\
          <el-form-item prop="mobile" :label="$t(\'sms.mobile\')">\
            <el-input v-model="dataForm.mobile" :placeholder="$t(\'sms.mobile\')"></el-input>\
          </el-form-item>\
          <el-form-item prop="params" :label="$t(\'sms.params\')">\
            <el-input v-model="dataForm.params" :placeholder="$t(\'sms.paramsTips\')"></el-input>\
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
          mobile: '',
          params: ''
        }
      }
    },
    computed: {
      dataRule: function () {
        var validateMobile = function (rule, value, callback) {
          if (!self.$validate.isMobile(value)) {
            return callback(new Error(self.$t('validate.format', { 'attr': self.$t('user.mobile') })));
          }
          callback();
        }
        return {
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
        });
      },
      // 表单提交
      dataFormSubmitHandle: _.debounce(function () {
        self.$refs['dataForm'].validate(function (valid) {
          if (!valid) {
            return false;
          }
          self.$http.post(
            '/sys/sms/send',
            self.dataForm,
            { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
          ).then(function (res) {
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
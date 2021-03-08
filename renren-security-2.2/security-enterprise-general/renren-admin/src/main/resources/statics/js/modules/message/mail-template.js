(function () {
  var vm = window.vm = new Vue({
    el: '.aui-wrapper',
    i18n: window.SITE_CONFIG.i18n,
    mixins: [window.SITE_CONFIG.mixinViewModule],
    data: function () {
      return {
        mixinViewModuleOptions: {
          getDataListURL: '/sys/mailtemplate/page',
          getDataListIsPage: true,
          deleteURL: '/sys/mailtemplate',
          deleteIsBatch: true
        },
        dataForm: {
          name: ''
        },
        configVisible: false,
        sendVisible: false
      }
    },
    components: {
      'add-or-update': fnAddOrUpdateComponent(),
      'config': fnConfigComponent(),
      'send': fnSendComponent()
    },
    beforeCreate: function () {
      vm = this;
    },
    methods: {
      // 邮件配置
      configHandle: function () {
        vm.configVisible = true;
        vm.$nextTick(function () {
          vm.$refs.config.init();
        });
      },
      // 发送邮件
      sendHandle: function (id) {
        vm.sendVisible = true;
        vm.$nextTick(function () {
          vm.$refs.send.dataForm.id = id;
          vm.$refs.send.init();
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
          <el-form-item prop="name" :label="$t(\'mail.name\')">\
            <el-input v-model="dataForm.name" :placeholder="$t(\'mail.name\')"></el-input>\
          </el-form-item>\
          <el-form-item prop="subject" :label="$t(\'mail.subject\')">\
            <el-input v-model="dataForm.subject" :placeholder="$t(\'mail.subject\')"></el-input>\
          </el-form-item>\
          <el-form-item prop="content" :label="$t(\'mail.content\')">\
            <!-- 富文本编辑器, 容器 -->\
            <div id="J_quillEditor"></div>\
            <!-- 自定义上传图片功能 (使用element upload组件) -->\
            <el-upload\
              :action="uploadUrl"\
              :show-file-list="false"\
              :before-upload="uploadBeforeUploadHandle"\
              :on-success="uploadSuccessHandle"\
              style="display: none;">\
              <el-button ref="uploadBtn" type="primary" size="small">{{ $t(\'upload.button\') }}</el-button>\
            </el-upload>\
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
        quillEditor: null,
        quillEditorToolbarOptions: [
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block', 'image'],
          [{ 'header': 1 }, { 'header': 2 }],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          [{ 'script': 'sub' }, { 'script': 'super' }],
          [{ 'indent': '-1' }, { 'indent': '+1' }],
          [{ 'direction': 'rtl' }],
          [{ 'size': ['small', false, 'large', 'huge'] }],
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'font': [] }],
          [{ 'align': [] }],
          ['clean']
        ],
        uploadUrl: '',
        dataForm: {
          id: '',
          name: '',
          subject: '',
          content: ''
        }
      }
    },
    computed: {
      dataRule: function () {
        var validateContent = function (rule, value, callback) {
          if (self.quillEditor.getLength() <= 1) {
            return callback(new Error(self.$t('validate.required')));
          }
          callback();
        }
        return {
          name: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' }
          ],
          subject: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' }
          ],
          content: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' },
            { validator: validateContent, trigger: 'blur' }
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
          if (self.quillEditor) {
            self.quillEditor.deleteText(0, self.quillEditor.getLength());
          } else {
            self.quillEditorHandle();
          }
          self.$refs['dataForm'].resetFields();
          if (self.dataForm.id) {
            self.getInfo();
          }
        });
      },
      // 富文本编辑器
      quillEditorHandle: function () {
        self.quillEditor = new Quill('#J_quillEditor', {
          modules: {
            toolbar: self.quillEditorToolbarOptions
          },
          theme: 'snow'
        });
        // 自定义上传图片功能 (使用element upload组件)
        self.uploadUrl = window.SITE_CONFIG['apiURL'] + '/sys/oss/upload';
        self.quillEditor.getModule('toolbar').addHandler('image', function () {
          self.$refs.uploadBtn.$el.click();
        });
        // 监听内容变化，动态赋值
        self.quillEditor.on('text-change', function () {
          self.dataForm.content = self.quillEditor.root.innerHTML;
        });
      },
      // 上传图片之前
      uploadBeforeUploadHandle: function (file) {
        if (file.type !== 'image/jpg' && file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif') {
          self.$message.error(self.$t('upload.tip', { 'format': 'jpg、png、gif' }));
          return false;
        }
      },
      // 上传图片成功
      uploadSuccessHandle: function (res, file, fileList) {
        if (res.code !== 0) {
          return self.$message.error(res.msg);
        }
        self.quillEditor.insertEmbed(self.quillEditor.getSelection().index, 'image', res.data.src);
      },
      // 获取信息
      getInfo: function () {
        self.$http.get('/sys/mailtemplate/' + self.dataForm.id).then(function (res) {
          if (res.data.code !== 0) {
            return self.$message.error(res.data.msg);
          }
          self.dataForm = res.data.data;
          self.quillEditor.root.innerHTML = self.dataForm.content;
        }).catch(function () {});
      },
      // 表单提交
      dataFormSubmitHandle: _.debounce(function () {
        self.$refs['dataForm'].validate(function (valid) {
          if (!valid) {
            return false;
          }
          self.$http[!self.dataForm.id ? 'post' : 'put'](
            '/sys/mailtemplate',
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

/**
 * config组件
 */
function fnConfigComponent () {
  var self = null;
  return {
    template: '\
      <el-dialog :visible.sync="visible" :title="$t(\'mail.config\')" :close-on-click-modal="false" :close-on-press-escape="false" :fullscreen="true">\
        <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmitHandle()" label-width="120px">\
          <el-form-item prop="smtp" :label="$t(\'mail.config\')">\
            <el-input v-model="dataForm.smtp" :placeholder="$t(\'mail.config\')"></el-input>\
          </el-form-item>\
          <el-form-item prop="port" :label="$t(\'mail.port\')">\
            <el-input v-model="dataForm.port" :placeholder="$t(\'mail.port\')"></el-input>\
          </el-form-item>\
          <el-form-item prop="username" :label="$t(\'mail.username\')">\
            <el-input v-model="dataForm.username" :placeholder="$t(\'mail.username\')"></el-input>\
          </el-form-item>\
          <el-form-item prop="password" :label="$t(\'mail.password\')">\
            <el-input v-model="dataForm.password" :placeholder="$t(\'mail.password\')"></el-input>\
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
          smtp: '',
          port: '',
          username: '',
          password: ''
        }
      }
    },
    computed: {
      dataRule: function () {
        return {
          smtp: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' }
          ],
          port: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' }
          ],
          username: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' }
          ],
          password: [
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
          self.getInfo();
        })
      },
      // 获取信息
      getInfo: function () {
        self.$http.get('/sys/mailtemplate/config').then(function (res) {
          if (res.data.code !== 0) {
            return self.$message.error(res.data.msg);
          }
          self.dataForm = res.data.data;
        }).catch(function () {})
      },
      // 表单提交
      dataFormSubmitHandle: _.debounce(function () {
        self.$refs['dataForm'].validate(function (valid) {
          if (!valid) {
            return false;
          }
          self.$http.post('/sys/mailtemplate/saveConfig', self.dataForm).then(function (res) {
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
 * send组件
 */
function fnSendComponent () {
  var self = null;
  return {
    template: '\
      <el-dialog :visible.sync="visible" :title="$t(\'mail.send\')" :close-on-click-modal="false" :close-on-press-escape="false" :fullscreen="true">\
        <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmitHandle()" label-width="120px">\
          <el-form-item prop="mailTo" :label="$t(\'mail.mailTo\')">\
            <el-input v-model="dataForm.mailTo" :placeholder="$t(\'mail.mailTo\')"></el-input>\
          </el-form-item>\
          <el-form-item prop="mailCc" :label="$t(\'mail.mailCc\')">\
            <el-input v-model="dataForm.mailCc" :placeholder="$t(\'mail.mailCc\')"></el-input>\
          </el-form-item>\
          <el-form-item prop="params" :label="$t(\'mail.params\')">\
            <el-input v-model="dataForm.params" :placeholder="$t(\'mail.paramsTips\')"></el-input>\
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
          mailTo: '',
          mailCc: '',
          params: ''
        }
      }
    },
    computed: {
      dataRule: function () {
        var validateEmail = function (rule, value, callback) {
          if (!self.$validate.isEmail(value)) {
            return callback(new Error(self.$t('validate.format', { 'attr': self.$t('user.email') })));
          }
          callback();
        }
        return {
          mailTo: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' },
            { validator: validateEmail, trigger: 'blur' }
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
            '/sys/mailtemplate/send',
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
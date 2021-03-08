(function () {
  var vm = window.vm = new Vue({
    el: '.aui-wrapper',
    i18n: window.SITE_CONFIG.i18n,
    mixins: [window.SITE_CONFIG.mixinViewModule],
    data: function () {
      return {
        mixinViewModuleOptions: {
          getDataListURL: '/demo/news/page',
          getDataListIsPage: true,
          deleteURL: '/demo/news',
          deleteIsBatch: true
        },
        daterange: null,
        dataForm: {
          title: '',
          startDate: '',
          endDate: ''
        }
      }
    },
    watch: {
      daterange: function (val) {
        vm.dataForm.startDate = val[0];
        vm.dataForm.endDate = val[1];
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
          <el-form-item prop="title" :label="$t(\'news.title\')">\
            <el-input v-model="dataForm.title" :placeholder="$t(\'news.title\')"></el-input>\
          </el-form-item>\
          <el-form-item prop="content" :label="$t(\'news.content\')">\
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
          <el-form-item prop="pubDate" :label="$t(\'news.pubDate\')">\
            <el-date-picker v-model="dataForm.pubDate" type="datetime" value-format="yyyy-MM-dd HH:mm:ss" :placeholder="$t(\'news.pubDate\')"></el-date-picker>\
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
          title: '',
          content: '',
          pubDate: ''
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
          title: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' }
          ],
          content: [
            { required: true, message: self.$t('validate.required'), trigger: 'blur' },
            { validator: validateContent, trigger: 'blur' }
          ],
          pubDate: [
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
          self.$message.error('只支持jpg、png、gif格式的图片！');
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
        self.$http.get('/demo/news/' + self.dataForm.id).then(function (res) {
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
            '/demo/news',
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
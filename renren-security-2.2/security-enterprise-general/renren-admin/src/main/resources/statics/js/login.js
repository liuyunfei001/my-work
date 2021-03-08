(function () {
  var vm = window.vm = new Vue({
    el: '.aui-wrapper',
    i18n: window.SITE_CONFIG.i18n,
    data: function () {
      return {
        captchaPath: '',
        dataForm: {
          username: '',
          password: '',
          captcha: ''
        }
      }
    },
    computed: {
      dataRule: function () {
        return {
          username: [
            { required: true, message: vm.$t('validate.required'), trigger: 'blur' }
          ],
          password: [
            { required: true, message: vm.$t('validate.required'), trigger: 'blur' }
          ],
          captcha: [
            { required: true, message: vm.$t('validate.required'), trigger: 'blur' }
          ]
        }
      }
    },
    watch: {
      '$i18n.locale': 'i18nHandle'
    },
    beforeCreate: function () {
      vm = this;
    },
    created: function () {
      if (self !== top) {
        window.parent.location.href = 'login.html';
        return false;
      }
      vm.i18nHandle(vm.$i18n.locale);
      vm.getCaptcha();
    },
    methods: {
      // 国际化
      i18nHandle: function (val) {
        Cookies.set('language', val);
        document.querySelector('html').setAttribute('lang', val);
        document.title = vm.$i18n.messages[val].brand.lg;
      },
      // 获取验证码
      getCaptcha: function () {
        vm.captchaPath = window.SITE_CONFIG['apiURL'] + '/captcha?t=' + new Date().getTime();
      },
      // 表单提交
      dataFormSubmitHandle: _.debounce(function () {
        vm.$refs['dataForm'].validate(function (valid) {
          if (!valid) {
            return false;
          }
          vm.$http.post('/login', vm.dataForm).then(function (res) {
            if (res.data.code !== 0) {
              vm.getCaptcha();
              return vm.$message.error(res.data.msg);
            }
            window.location.href = 'index.html';
          }).catch(function () {});
        })
      }, 1000, { 'leading': true, 'trailing': false })
    }
  });
})();
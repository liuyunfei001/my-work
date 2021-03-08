(function () {
  var vm = window.vm = new Vue({
    el: '.aui-wrapper',
    i18n: window.SITE_CONFIG.i18n,
    mixins: [window.SITE_CONFIG.mixinViewModule],
    data: function () {
      return {
        mixinViewModuleOptions: {
          getDataListURL: '/sys/log/error/page',
          getDataListIsPage: true,
          exportURL: '/sys/log/error/export'
        }
      }
    },
    beforeCreate: function () {
      vm = this;
    },
    methods: {
      // 异常信息
      infoHandle: function (info) {
        vm.$alert(info, vm.$t('logError.errorInfo'), {
          customClass: 'mod-sys__log-error-view-info'
        });
      }
    }
  });
})();
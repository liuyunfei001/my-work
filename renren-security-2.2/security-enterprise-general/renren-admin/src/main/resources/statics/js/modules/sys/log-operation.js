(function () {
  var vm = window.vm = new Vue({
    el: '.aui-wrapper',
    i18n: window.SITE_CONFIG.i18n,
    mixins: [window.SITE_CONFIG.mixinViewModule],
    data: function () {
      return {
        mixinViewModuleOptions: {
          getDataListURL: '/sys/log/operation/page',
          getDataListIsPage: true,
          exportURL: '/sys/log/operation/export'
        },
        dataForm: {
          status: ''
        }
      }
    },
    beforeCreate: function () {
      vm = this;
    }
  });
})();
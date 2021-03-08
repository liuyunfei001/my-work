(function () {
  var vm = window.vm = new Vue({
    el: '.aui-wrapper',
    i18n: window.SITE_CONFIG.i18n,
    mixins: [window.SITE_CONFIG.mixinViewModule],
    data: function () {
      return {
        mixinViewModuleOptions: {
          getDataListURL: '/sys/maillog/page',
          getDataListIsPage: true,
          deleteURL: '/sys/maillog',
          deleteIsBatch: true
        },
        dataForm: {
          templateId: '',
          mailTo: '',
          status: null
        }
      }
    },
    beforeCreate: function () {
      vm = this;
    }
  });
})();
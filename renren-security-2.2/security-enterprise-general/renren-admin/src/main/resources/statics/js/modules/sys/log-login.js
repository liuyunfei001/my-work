(function () {
  var vm = window.vm = new Vue({
    el: '.aui-wrapper',
    i18n: window.SITE_CONFIG.i18n,
    mixins: [window.SITE_CONFIG.mixinViewModule],
    data: function () {
      return {
        mixinViewModuleOptions: {
          getDataListURL: '/sys/log/login/page',
          getDataListIsPage: true,
          exportURL: '/sys/log/login/export'
        },
        dataForm: {
          creatorName: '',
          status: ''
        }
      }
    },
    beforeCreate: function () {
      vm = this;
    }
  });
})();
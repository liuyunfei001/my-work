(function () {
  var vm = window.vm = new Vue({
    el: '.aui-wrapper',
    i18n: window.SITE_CONFIG.i18n,
    mixins: [window.SITE_CONFIG.mixinViewModule],
    data: function () {
      return {
        mixinViewModuleOptions: {
          getDataListURL: '/act/running/page',
          getDataListIsPage: true,
          deleteURL: '/act/running'
        },
        dataForm: {
          id: '',
          definitionKey: ''
        }
      }
    },
    beforeCreate: function () {
      vm = this;
    }
  });
})();
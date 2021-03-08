(function () {
  var vm = window.vm = new Vue({
    el: '.aui-wrapper',
    i18n: window.SITE_CONFIG.i18n,
    data: function () {
      return {
        sysInfo: {
          osName: '',
          osVersion: '',
          osArch: '',
          processors: 0,
          totalPhysical: 0,
          freePhysical: 0,
          memoryRate: 0,
          userLanguage: '',
          jvmName: '',
          javaVersion: '',
          javaHome: '',
          userDir: '',
          javaTotalMemory: 0,
          javaFreeMemory: 0,
          javaMaxMemory: 0,
          userName: '',
          systemCpuLoad: 0,
          userTimezone: ''
        }
      }
    },
    beforeCreate: function () {
      vm = this;
    },
    created: function () {
      vm.getSysInfo();
    },
    methods: {
      getSysInfo: function () {
        vm.$http.get('/sys/info').then(function (res) {
          if (res.data.code !== 0) {
            return vm.$message.error(res.data.msg);
          }
          vm.sysInfo = res.data.data;
        }).catch(function () {});
      }
    }
  });
})();
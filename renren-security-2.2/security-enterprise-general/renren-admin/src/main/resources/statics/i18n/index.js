(function () {
  Vue.use(VueI18n);
  
  window.SITE_CONFIG.i18n = new VueI18n({
    locale: Cookies.get('language') || 'zh-CN',
    messages: {
      'zh-CN': _.merge({ '_lang': '简体中文' }, window.SITE_CONFIG.i18nZHCN, ELEMENT.lang.zhCN),
      'zh-TW': _.merge({ '_lang': '繁體中文' }, window.SITE_CONFIG.i18nZHTW, ELEMENT.lang.zhTW),
      'en-US': _.merge({ '_lang': 'English' }, window.SITE_CONFIG.i18nENUS, ELEMENT.lang.en)
    }
  });

  Vue.use(ELEMENT, {
    i18n: function (key, value) { return window.SITE_CONFIG.i18n.t(key, value); } 
  });
})();
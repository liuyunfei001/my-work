(function () {
  window.SITE_CONFIG = {};
  window.SITE_CONFIG['version'] = 'v2.0.1';
  window.SITE_CONFIG['apiURL'] = '/renren-admin/';
  window.SITE_CONFIG['permissions'] = []; // 页面按钮操作权限（后台返回，未做处理）
  window.SITE_CONFIG['routeList'] = [     // 路由列表（默认添加首页）
    {
      'menuId': 'home',
      'name': 'home',
      'title': 'home',
      'url': './home.html',
      'params': {}
    }
  ];
})();
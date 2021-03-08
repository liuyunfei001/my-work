(function () {
  window.SITE_CONFIG.mixinViewModule = {
    data: function () {
      return {
        // 设置属性
        mixinViewModuleOptions: {
          activatedIsNeed: true,    // 此页面是否在激活（进入）时，调用查询数据列表接口？
          getDataListURL: '',       // 数据列表接口，API地址
          getDataListIsPage: false, // 数据列表接口，是否需要分页？
          deleteURL: '',            // 删除接口，API地址
          deleteIsBatch: false,     // 删除接口，是否需要批量？
          deleteIsBatchKey: 'id',   // 删除接口，批量状态下由那个key进行标记操作？比如：pid，uid...
          exportURL: ''             // 导出接口，API地址
        },
        // 默认属性
        dataForm: {},               // 查询条件
        dataList: [],               // 数据列表
        order: '',                  // 排序，asc／desc
        orderField: '',             // 排序，字段
        page: 1,                    // 当前页码
        limit: 10,                  // 每页数
        total: 0,                   // 总条数
        dataListLoading: false,     // 数据列表，loading状态
        dataListSelections: [],     // 数据列表，多选项
        addOrUpdateVisible: false   // 新增／更新，弹窗visible状态
      }
    },
    created: function () {
      if (this.mixinViewModuleOptions.activatedIsNeed) {
        this.getDataList();
      }
    },
    methods: {
      // 获取数据列表
      getDataList: function () {
        var self = this;
        self.dataListLoading = true;
        self.$http.get(
          self.mixinViewModuleOptions.getDataListURL,
          {
            params: _.merge({
              order: self.order,
              orderField: self.orderField,
              page: self.mixinViewModuleOptions.getDataListIsPage ? self.page : null,
              limit: self.mixinViewModuleOptions.getDataListIsPage ? self.limit : null
            }, self.dataForm)
          }
        ).then(function (res) {
          self.dataListLoading = false;
          if (res.data.code !== 0) {
            self.dataList = [];
            self.total = 0;
            return self.$message.error(res.data.msg);
          }
          self.dataList = self.mixinViewModuleOptions.getDataListIsPage ? res.data.data.list : res.data.data;
          self.total = self.mixinViewModuleOptions.getDataListIsPage ? res.data.data.total : 0;
        }).catch(function () {
          self.dataListLoading = false;
        })
      },
      // 多选
      dataListSelectionChangeHandle: function (val) {
        this.dataListSelections = val;
      },
      // 排序
      dataListSortChangeHandle: function (data) {
        if (!data.order || !data.prop) {
          this.order = '';
          this.orderField = '';
          return false;
        }
        this.order = data.order.replace(/ending$/, '');
        this.orderField = data.prop.replace(/([A-Z])/g, '_$1').toLowerCase();
        this.getDataList();
      },
      // 分页, 每页条数
      pageSizeChangeHandle: function (val) {
        this.page = 1;
        this.limit = val;
        this.getDataList();
      },
      // 分页, 当前页
      pageCurrentChangeHandle: function (val) {
        this.page = val;
        this.getDataList();
      },
      // 新增 / 修改
      addOrUpdateHandle: function (id) {
        var self = this;
        self.addOrUpdateVisible = true;
        self.$nextTick(function () {
          self.$refs.addOrUpdate.dataForm.id = id;
          self.$refs.addOrUpdate.init();
        })
      },
      // 删除
      deleteHandle: function (id) {
        var self = this;
        if (self.mixinViewModuleOptions.deleteIsBatch && !id && self.dataListSelections.length <= 0) {
          return self.$message({
            message: self.$t('prompt.deleteBatch'),
            type: 'warning',
            duration: 500
          });
        }
        self.$confirm(self.$t('prompt.info', { 'handle': self.$t('delete') }), self.$t('prompt.title'), {
          confirmButtonText: self.$t('confirm'),
          cancelButtonText: self.$t('cancel'),
          type: 'warning'
        }).then(function () {
          self.$http.delete(
            self.mixinViewModuleOptions.deleteURL + (self.mixinViewModuleOptions.deleteIsBatch ? '' : '/' + id),
            self.mixinViewModuleOptions.deleteIsBatch ? {
              'data': id ? [id] : self.dataListSelections.map(function (item) { return item[self.mixinViewModuleOptions.deleteIsBatchKey]; })
            } : {}
          ).then(function (res) {
            if (res.data.code !== 0) {
              return self.$message.error(res.data.msg);
            }
            self.$message({
              message: self.$t('prompt.success'),
              type: 'success',
              duration: 500,
              onClose: function () {
                self.getDataList();
              }
            });
          }).catch(function () {});
        }).catch(function () {});
      },
      // 导出
      exportHandle: function () {
        window.location.href = window.SITE_CONFIG['apiURL'] + this.mixinViewModuleOptions.exportURL + '?' + Qs.stringify(this.dataForm);
      }
    }
  }
})();
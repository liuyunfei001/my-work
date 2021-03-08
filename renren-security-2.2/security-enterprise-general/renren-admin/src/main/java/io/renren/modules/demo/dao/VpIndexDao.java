package io.renren.modules.demo.dao;

import io.renren.common.dao.BaseDao;
import io.renren.modules.demo.entity.VpIndexEntity;
import org.apache.ibatis.annotations.Mapper;

/**
 * 个人信息表
 *
 * @author Mark sunlightcs@gmail.com
 * @since 1.0.0 2020-08-07
 */
@Mapper
public interface VpIndexDao extends BaseDao<VpIndexEntity> {
	
}
package io.renren.modules.demo.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import io.renren.common.service.impl.CrudServiceImpl;
import io.renren.modules.demo.dao.VpIndexDao;
import io.renren.modules.demo.dto.VpIndexDTO;
import io.renren.modules.demo.entity.VpIndexEntity;
import io.renren.modules.demo.service.VpIndexService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * 个人信息表
 *
 * @author Mark sunlightcs@gmail.com
 * @since 1.0.0 2020-08-07
 */
@Service
public class VpIndexServiceImpl extends CrudServiceImpl<VpIndexDao, VpIndexEntity, VpIndexDTO> implements VpIndexService {

    @Override
    public QueryWrapper<VpIndexEntity> getWrapper(Map<String, Object> params){
        String id = (String)params.get("id");

        QueryWrapper<VpIndexEntity> wrapper = new QueryWrapper<>();
        wrapper.eq(StringUtils.isNotBlank(id), "id", id);

        return wrapper;
    }


}
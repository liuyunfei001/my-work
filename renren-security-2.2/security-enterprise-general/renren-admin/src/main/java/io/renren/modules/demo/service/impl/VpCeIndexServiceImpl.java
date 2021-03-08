package io.renren.modules.demo.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import io.renren.common.service.impl.CrudServiceImpl;
import io.renren.modules.demo.dao.VpCeIndexDao;
import io.renren.modules.demo.dto.VpCeIndexDTO;
import io.renren.modules.demo.entity.VpCeIndexEntity;
import io.renren.modules.demo.service.VpCeIndexService;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * 
 *
 * @author Mark sunlightcs@gmail.com
 * @since 1.0.0 2020-08-07
 */
@Service
public class VpCeIndexServiceImpl extends CrudServiceImpl<VpCeIndexDao, VpCeIndexEntity, VpCeIndexDTO> implements VpCeIndexService {

    @Override
    public QueryWrapper<VpCeIndexEntity> getWrapper(Map<String, Object> params){
        String id = (String)params.get("id");

        QueryWrapper<VpCeIndexEntity> wrapper = new QueryWrapper<>();
        wrapper.eq(StringUtils.isNotBlank(id), "id", id);

        return wrapper;
    }


}
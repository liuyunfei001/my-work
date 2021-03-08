/**
 * Copyright (c) 2018 人人开源 All rights reserved.
 *
 * https://www.renren.io
 *
 * 版权所有，侵权必究！
 */

package io.renren.modules.activiti.service;

import io.renren.common.constant.Constant;
import io.renren.common.page.PageData;
import org.activiti.engine.RuntimeService;
import org.activiti.engine.runtime.ProcessInstance;
import org.activiti.engine.runtime.ProcessInstanceQuery;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 运行中的流程
 *
 * @author Mark sunlightcs@gmail.com
 * @since 1.0.0
 */
@Service
public class ActRunningService {
    @Autowired
    private RuntimeService runtimeService;

    /**
     * 流程定义列表
     */
    public PageData<Map<String, Object>> page(Map<String, Object> params) {
        String id = (String)params.get("id");
        String definitionKey = (String)params.get("definitionKey");

        //分页参数
        Integer curPage = 1;
        Integer limit = 10;
        if(params.get(Constant.PAGE) != null){
            curPage = Integer.parseInt((String)params.get(Constant.PAGE));
        }
        if(params.get(Constant.LIMIT) != null){
            limit = Integer.parseInt((String)params.get(Constant.LIMIT));
        }

        ProcessInstanceQuery processInstanceQuery = runtimeService.createProcessInstanceQuery();
        if (StringUtils.isNotBlank(id)){
            processInstanceQuery.processInstanceId(id);
        }
        if (StringUtils.isNotBlank(definitionKey)){
            processInstanceQuery.processDefinitionKey(definitionKey);
        }

        List<ProcessInstance> processInstanceList = processInstanceQuery.listPage((curPage - 1) * limit, limit);
        List<Map<String, Object>> objectList = new ArrayList<>();
        for (ProcessInstance processInstance : processInstanceList) {
            objectList.add(processInstanceConvert(processInstance));
        }
        return new PageData<>(objectList, (int)processInstanceQuery.count());
    }

    /**
     * 流程实例信息
     */
    private Map<String, Object> processInstanceConvert(ProcessInstance processInstance) {
        Map<String, Object> map = new HashMap<>(7);
        map.put("id", processInstance.getId());
        map.put("processInstanceId", processInstance.getProcessInstanceId());
        map.put("processDefinitionId", processInstance.getProcessDefinitionId());
        map.put("processDefinitionName", processInstance.getProcessDefinitionName());
        map.put("processDefinitionKey", processInstance.getProcessDefinitionKey());
        map.put("activityId", processInstance.getActivityId());
        map.put("suspended", processInstance.isSuspended());

        return map;
    }

    /**
     * 删除实例
     * @param id  实例ID
     */
    public void delete(String id){
        runtimeService.deleteProcessInstance(id, null);
    }

    /**
     * 启动流程实例
     * @param key 流程定义标识key
     */
    public void startProcess(String key){
        runtimeService.startProcessInstanceByKey(key);
    }
}

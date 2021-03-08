/**
 * Copyright (c) 2018 人人开源 All rights reserved.
 *
 * https://www.renren.io
 *
 * 版权所有，侵权必究！
 */

package io.renren.modules.activiti.controller;

import io.renren.common.annotation.LogOperation;
import io.renren.common.constant.Constant;
import io.renren.common.exception.ErrorCode;
import io.renren.common.page.PageData;
import io.renren.common.utils.Result;
import io.renren.modules.activiti.service.ActProcessService;
import io.swagger.annotations.*;
import org.apache.commons.io.IOUtils;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import springfox.documentation.annotations.ApiIgnore;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

/**
 * 流程管理
 *
 * @author Mark sunlightcs@gmail.com
 */
@RestController
@RequestMapping("/act/process")
@Api(tags="流程管理")
public class ActProcessController {
    @Autowired
    private ActProcessService actProcessService;

    @GetMapping("page")
    @ApiOperation("分页")
    @ApiImplicitParams({
        @ApiImplicitParam(name = Constant.PAGE, value = "当前页码，从1开始", paramType = "query", required = true, dataType="int") ,
        @ApiImplicitParam(name = Constant.LIMIT, value = "每页显示记录数", paramType = "query",required = true, dataType="int") ,
        @ApiImplicitParam(name = "key", value = "key", paramType = "query", dataType="String"),
        @ApiImplicitParam(name = "processName", value = "processName", paramType = "query", dataType="String")
    })
    @RequiresPermissions("sys:process:all")
    public Result<PageData<Map<String, Object>>> page(@ApiIgnore @RequestParam Map<String, Object> params){
        PageData<Map<String, Object>> page = actProcessService.page(params);

        return new Result<PageData<Map<String, Object>>>().ok(page);
    }

    @PostMapping("deploy")
    @ApiOperation("部署流程文件")
    @LogOperation("部署流程文件")
    @ApiImplicitParam(name = "processFile", value = "流程文件", paramType = "query", dataType="file")
    @RequiresPermissions("sys:process:all")
    public Result deploy(@RequestParam("processFile") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return new Result().error(ErrorCode.UPLOAD_FILE_EMPTY);
        }

        actProcessService.deploy(file);

        return new Result();
    }

    @PutMapping("active/{id}")
    @LogOperation("激活流程")
    @ApiImplicitParam(name = "id", value = "流程ID", paramType = "query", dataType="String")
    @RequiresPermissions("sys:process:all")
    public Result active(@PathVariable("id") String id) {
        actProcessService.active(id);

        return new Result();
    }

    @PutMapping("suspend/{id}")
    @ApiOperation("挂起流程")
    @LogOperation("挂起流程")
    @ApiImplicitParam(name = "id", value = "流程ID", paramType = "query", dataType="String")
    @RequiresPermissions("sys:process:all")
    public Result suspend(@PathVariable("id") String id) {
        actProcessService.suspend(id);

        return new Result();
    }

    @PostMapping("convertToModel/{id}")
    @ApiOperation("将部署的流程转换为模型")
    @LogOperation("将部署的流程转换为模型")
    @ApiImplicitParam(name = "id", value = "流程ID", paramType = "query", dataType="String")
    @RequiresPermissions("sys:process:all")
    public Result convertToModel(@PathVariable("id") String id) throws Exception {
        actProcessService.convertToModel(id);

        return new Result();
    }

    @DeleteMapping
    @ApiOperation("删除流程")
    @LogOperation("删除流程")
    @RequiresPermissions("sys:process:all")
    public Result delete(@RequestBody String[] deploymentIds) {
        for(String deploymentId : deploymentIds) {
            actProcessService.deleteDeployment(deploymentId);
        }
        return new Result();
    }

    @GetMapping(value = "resource")
    @ApiOperation("获取资源文件")
    @ApiImplicitParams({
        @ApiImplicitParam(name = "deploymentId", value = "部署ID", paramType = "query", dataType="String"),
        @ApiImplicitParam(name = "resourceName", value = "资源名称", paramType = "query", dataType="String")
    })
    @RequiresPermissions("sys:process:all")
    public void resource(String deploymentId, String resourceName, @ApiIgnore HttpServletResponse response) throws Exception {
        InputStream resourceAsStream = actProcessService.getResourceAsStream(deploymentId, resourceName);

        IOUtils.copy(resourceAsStream, response.getOutputStream());
    }

}
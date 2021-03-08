/**
 * Copyright (c) 2018 人人开源 All rights reserved.
 *
 * https://www.renren.io
 *
 * 版权所有，侵权必究！
 */

package io.renren.modules.message.sms;

import io.renren.common.constant.Constant;
import io.renren.common.utils.SpringContextUtils;
import io.renren.modules.sys.service.SysParamsService;

/**
 * 短信Factory
 *
 * @author Mark sunlightcs@gmail.com
 */
public class SmsFactory {
    private static SysParamsService sysParamsService;

    static {
        SmsFactory.sysParamsService = SpringContextUtils.getBean(SysParamsService.class);
    }

    public static AbstractSmsService build(){
        //获取短信配置信息
        SmsConfig config = sysParamsService.getValueObject(Constant.SMS_CONFIG_KEY, SmsConfig.class);

        if(config.getPlatform() == Constant.SmsService.ALIYUN.getValue()){
            return new AliyunSmsService(config);
        }else if(config.getPlatform() == Constant.SmsService.QCLOUD.getValue()){
            return new QcloudSmsService(config);
        }

        return null;
    }
}

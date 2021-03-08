package io.renren.modules.demo.excel;

import cn.afterturn.easypoi.excel.annotation.Excel;
import lombok.Data;

import java.util.Date;

/**
 * 个人信息表
 *
 * @author Mark sunlightcs@gmail.com
 * @since 1.0.0 2020-08-07
 */
@Data
public class VpIndexExcel {
    @Excel(name = "姓名")
    private String vpName;
    @Excel(name = "性别")
    private Integer vpSex;
    @Excel(name = "身高")
    private Double vpHeight;
    @Excel(name = "手机")
    private String vpPhone;
    @Excel(name = "身份证号")
    private String vpId;
    @Excel(name = "体重")
    private Double vpWeight;
    @Excel(name = "年龄")
    private Integer vpAge;
    @Excel(name = "地址")
    private String vpAddress;
    @Excel(name = "需求")
    private String vpNeed;
    @Excel(name = "备注")
    private String vpRemarks;
    @Excel(name = "主键")
    private Integer id;

}
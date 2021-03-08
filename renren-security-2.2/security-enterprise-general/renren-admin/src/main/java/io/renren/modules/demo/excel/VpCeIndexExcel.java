package io.renren.modules.demo.excel;

import cn.afterturn.easypoi.excel.annotation.Excel;
import lombok.Data;

import java.util.Date;

/**
 * 
 *
 * @author Mark sunlightcs@gmail.com
 * @since 1.0.0 2020-08-07
 */
@Data
public class VpCeIndexExcel {
    @Excel(name = "主键id")
    private Integer id;
    @Excel(name = "所属用户主键")
    private Integer vpId;
    @Excel(name = "测试日期")
    private Date testDate;
    @Excel(name = "测试体重")
    private Double vpWeight;
    @Excel(name = "脂肪率")
    private Double vpTzl;
    @Excel(name = "水分比率")
    private Double vpSf;
    @Excel(name = "肌肉量")
    private Double vpJrl;
    @Excel(name = "骨量钙")
    private Double vpGlg;
    @Excel(name = "体形")
    private Integer vpTx;
    @Excel(name = "基础代谢")
    private String vpDxz;
    @Excel(name = "代谢年龄")
    private Integer vpDxage;
    @Excel(name = "体重指数")
    private Double vpBmi;

}
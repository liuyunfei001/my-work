package io.renren.modules.demo.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;


/**
 * 
 *
 * @author Mark sunlightcs@gmail.com
 * @since 1.0.0 2020-08-07
 */
@Data
@ApiModel(value = "")
public class VpCeIndexDTO implements Serializable {
    private static final long serialVersionUID = 1L;

	@ApiModelProperty(value = "主键id")
	private Integer id;

	@ApiModelProperty(value = "所属用户主键")
	private Integer vpId;

	@ApiModelProperty(value = "测试日期")
	private Date testDate;

	@ApiModelProperty(value = "测试体重")
	private Double vpWeight;

	@ApiModelProperty(value = "脂肪率")
	private Double vpTzl;

	@ApiModelProperty(value = "水分比率")
	private Double vpSf;

	@ApiModelProperty(value = "肌肉量")
	private Double vpJrl;

	@ApiModelProperty(value = "骨量钙")
	private Double vpGlg;

	@ApiModelProperty(value = "体形")
	private Integer vpTx;

	@ApiModelProperty(value = "基础代谢")
	private String vpDxz;

	@ApiModelProperty(value = "代谢年龄")
	private Integer vpDxage;

	@ApiModelProperty(value = "体重指数")
	private Double vpBmi;


}
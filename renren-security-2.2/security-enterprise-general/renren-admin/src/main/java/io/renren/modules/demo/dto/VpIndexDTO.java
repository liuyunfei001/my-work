package io.renren.modules.demo.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;


/**
 * 个人信息表
 *
 * @author Mark sunlightcs@gmail.com
 * @since 1.0.0 2020-08-07
 */
@Data
@ApiModel(value = "个人信息表")
public class VpIndexDTO implements Serializable {
    private static final long serialVersionUID = 1L;

	@ApiModelProperty(value = "姓名")
	private String vpName;

	@ApiModelProperty(value = "性别")
	private Integer vpSex;

	@ApiModelProperty(value = "身高")
	private Double vpHeight;

	@ApiModelProperty(value = "手机")
	private String vpPhone;

	@ApiModelProperty(value = "身份证号")
	private String vpId;

	@ApiModelProperty(value = "体重")
	private Double vpWeight;

	@ApiModelProperty(value = "年龄")
	private Integer vpAge;

	@ApiModelProperty(value = "地址")
	private String vpAddress;

	@ApiModelProperty(value = "需求")
	private String vpNeed;

	@ApiModelProperty(value = "备注")
	private String vpRemarks;

	@ApiModelProperty(value = "主键")
	private Integer id;


}
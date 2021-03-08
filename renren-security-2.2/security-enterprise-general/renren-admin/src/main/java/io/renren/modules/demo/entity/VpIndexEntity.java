package io.renren.modules.demo.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import io.renren.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Date;

/**
 * 个人信息表
 *
 * @author Mark sunlightcs@gmail.com
 * @since 1.0.0 2020-08-07
 */
@Data
@EqualsAndHashCode(callSuper=false)
@TableName("vp_index")
public class VpIndexEntity extends BaseEntity {
	private static final long serialVersionUID = 1L;

    /**
     * 姓名
     */
	private String vpName;
    /**
     * 性别
     */
	private Integer vpSex;
    /**
     * 身高
     */
	private Double vpHeight;
    /**
     * 手机
     */
	private String vpPhone;
    /**
     * 身份证号
     */
	private String vpId;
    /**
     * 体重
     */
	private Double vpWeight;
    /**
     * 年龄
     */
	private Integer vpAge;
    /**
     * 地址
     */
	private String vpAddress;
    /**
     * 需求
     */
	private String vpNeed;
    /**
     * 备注
     */
	private String vpRemarks;
    /**
     * 主键
     */
	private Long id;

	private Long creator;

	private Date createDate;
}
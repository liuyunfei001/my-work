package io.renren.modules.demo.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import io.renren.common.entity.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Date;

/**
 * 
 *
 * @author Mark sunlightcs@gmail.com
 * @since 1.0.0 2020-08-07
 */
@Data
@EqualsAndHashCode(callSuper=false)
@TableName("vp_ce_index")
public class VpCeIndexEntity extends BaseEntity {
	private static final long serialVersionUID = 1L;

    /**
     * 主键id
     */
	private Long id;
    /**
     * 所属用户主键
     */
	private Long vpId;
    /**
     * 测试日期
     */
	private Date testDate;
    /**
     * 测试体重
     */
	private Double vpWeight;
    /**
     * 脂肪率
     */
	private Double vpTzl;
    /**
     * 水分比率
     */
	private Double vpSf;
    /**
     * 肌肉量
     */
	private Double vpJrl;
    /**
     * 骨量钙
     */
	private Double vpGlg;
    /**
     * 体形
     */
	private Integer vpTx;
    /**
     * 基础代谢
     */
	private String vpDxz;
    /**
     * 代谢年龄
     */
	private Integer vpDxage;
    /**
     * 体重指数
     */
	private Double vpBmi;

	private Long creator;

	private Date createDate;
}
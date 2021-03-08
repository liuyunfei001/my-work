/**
 * Copyright 2018 人人开源 http://www.renren.io
 * <p>
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * <p>
 * http://www.apache.org/licenses/LICENSE-2.0
 * <p>
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

package io.renren.modules.security.realm;

import io.renren.common.exception.ErrorCode;
import io.renren.common.utils.ConvertUtils;
import io.renren.common.utils.MessageUtils;
import io.renren.modules.security.password.PasswordUtils;
import io.renren.modules.security.service.ShiroService;
import io.renren.modules.security.user.UserDetail;
import io.renren.modules.sys.entity.SysUserEntity;
import org.apache.shiro.authc.*;
import org.apache.shiro.authc.credential.CredentialsMatcher;
import org.apache.shiro.authz.AuthorizationInfo;
import org.apache.shiro.authz.SimpleAuthorizationInfo;
import org.apache.shiro.realm.AuthorizingRealm;
import org.apache.shiro.subject.PrincipalCollection;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * 认证
 *
 * @author Mark sunlightcs@gmail.com
 */
@Component
public class UserRealm extends AuthorizingRealm {
	@Autowired
	private ShiroService shiroService;
    
    /**
     * 授权(验证权限时调用)
     */
	@Override
	protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principals) {
		UserDetail user = (UserDetail)principals.getPrimaryPrincipal();

		//用户权限列表
		Set<String> permsSet = shiroService.getUserPermissions(user);

		SimpleAuthorizationInfo info = new SimpleAuthorizationInfo();
		info.setStringPermissions(permsSet);
		return info;
	}

	/**
	 * 认证(登录时调用)
	 */
	@Override
	protected AuthenticationInfo doGetAuthenticationInfo(
			AuthenticationToken authcToken) throws AuthenticationException {
		UsernamePasswordToken token = (UsernamePasswordToken)authcToken;

		//查询用户信息
		SysUserEntity userEntity = shiroService.getByUsername(token.getUsername());
		if(userEntity == null){
			throw new UnknownAccountException(MessageUtils.getMessage(ErrorCode.ACCOUNT_NOT_EXIST));
		}

		//转换成UserDetail对象
		UserDetail userDetail = ConvertUtils.sourceToTarget(userEntity, UserDetail.class);

		//获取用户对应的部门数据权限
		List<Long> deptIdList = shiroService.getDataScopeList(userDetail.getId());
		userDetail.setDeptIdList(deptIdList);

		//账号锁定
		if(userDetail.getStatus() == 0){
			throw new LockedAccountException(MessageUtils.getMessage(ErrorCode.ACCOUNT_LOCK));
		}

		SimpleAuthenticationInfo info = new SimpleAuthenticationInfo(userDetail, userEntity.getPassword(), getName());
		return info;
	}

	@Override
	public void setCredentialsMatcher(CredentialsMatcher credentialsMatcher) {
		CredentialsMatcher credentials = (token, info) -> {
			UsernamePasswordToken userToken = (UsernamePasswordToken) token;
			//登录密码
			String loginPassword = new String(userToken.getPassword());
			//数据库里，加密后的密码
			String dbPassword = info.getCredentials().toString();

			return PasswordUtils.matches(loginPassword, dbPassword);
		};

		super.setCredentialsMatcher(credentials);
	}
}

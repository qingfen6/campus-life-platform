import React from 'react';
import * as AntdIcons from '@ant-design/icons';

// 创建一个图标适配器
export const IconAdapter = (props: { 
  icon: React.ComponentType<any>;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) => {
  const { icon: Icon, ...rest } = props;
  return <Icon {...rest} />;
};

// 导出所有图标的包装组件
export const SearchOutlined = (props: any) => <AntdIcons.SearchOutlined {...props} />;
export const BellOutlined = (props: any) => <AntdIcons.BellOutlined {...props} />;
export const MailOutlined = (props: any) => <AntdIcons.MailOutlined {...props} />;
export const LikeOutlined = (props: any) => <AntdIcons.LikeOutlined {...props} />;
export const MessageOutlined = (props: any) => <AntdIcons.MessageOutlined {...props} />;
export const CommentOutlined = (props: any) => <AntdIcons.CommentOutlined {...props} />;
export const ShareAltOutlined = (props: any) => <AntdIcons.ShareAltOutlined {...props} />;
export const UserOutlined = (props: any) => <AntdIcons.UserOutlined {...props} />;
export const LockOutlined = (props: any) => <AntdIcons.LockOutlined {...props} />;
export const ShopOutlined = (props: any) => <AntdIcons.ShopOutlined {...props} />;
export const AlertOutlined = (props: any) => <AntdIcons.AlertOutlined {...props} />;
export const TeamOutlined = (props: any) => <AntdIcons.TeamOutlined {...props} />;
export const EnvironmentOutlined = (props: any) => <AntdIcons.EnvironmentOutlined {...props} />;
export const HeartOutlined = (props: any) => <AntdIcons.HeartOutlined {...props} />; 
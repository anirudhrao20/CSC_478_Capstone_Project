// src/components/header/Header.tsx

import "./Header.css";
import type { RefineThemedLayoutV2HeaderProps } from "@refinedev/antd";
import { useGetIdentity } from "@refinedev/core";
import {
  Layout as AntdLayout,
  Avatar,
  Space,
  Switch,
  theme,
  Typography,
} from "antd";
import React, { useContext } from "react";
import { ColorModeContext } from "../../contexts/color-mode";
import { UserOutlined, DownOutlined } from "@ant-design/icons";
import { Dropdown, Menu } from "antd";

const { Text } = Typography;
const { useToken } = theme;

type IUser = {
  id: number;
  name: string;
  avatar: string;
};

export const Header: React.FC<RefineThemedLayoutV2HeaderProps> = ({
  sticky = true,
}) => {
  const { token } = useToken();
  const { data: user } = useGetIdentity<IUser>();
  const { mode, setMode } = useContext(ColorModeContext);

  const headerStyles: React.CSSProperties = {
    backgroundColor: token.colorBgElevated,
    display: "flex",
    justifyContent: "space-between", // Logo on left, user actions on right
    alignItems: "center",
    padding: "0px 24px",
    height: "64px",
  };

  if (sticky) {
    headerStyles.position = "sticky";
    headerStyles.top = 0;
    headerStyles.zIndex = 1;
  }

  const userMenu = (
    <Menu>
      <Menu.Item key="0">
        <a href="/profile">Profile</a>
      </Menu.Item>
      <Menu.Item key="1">
        <a href="/settings">Settings</a>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="2">
        <a href="/logout">Logout</a>
      </Menu.Item>
    </Menu>
  );

  return (
    <AntdLayout.Header style={headerStyles} className="Header_antdLayoutHeader">
      {/* Left Side: Logo or App Title */}
      <div style={{ display: "flex", alignItems: "center" }}></div>

      {/* Right Side: Theme Switch, User Info */}
      <Space>
        {/* Dark/Light Mode Switch */}
        <Switch
          checkedChildren="🌛"
          unCheckedChildren="🔆"
          onChange={() => setMode(mode === "light" ? "dark" : "light")}
          defaultChecked={mode === "dark"}
        />

        {/* User Avatar and Dropdown */}
        <Dropdown overlay={userMenu} trigger={["click"]}>
          <Space style={{ marginLeft: "8px" }} size="middle">
            {user?.name && <Text strong>{user.name}</Text>}
            {user?.avatar ? (
              <Avatar src={user.avatar} alt={user.name} />
            ) : (
              <Avatar icon={<UserOutlined />} />
            )}
            <DownOutlined />
          </Space>
        </Dropdown>
      </Space>
    </AntdLayout.Header>
  );
};

export default Header;

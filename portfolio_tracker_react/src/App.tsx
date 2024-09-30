// src/App.tsx

import { GitHubBanner, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { useNotificationProvider } from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";
import { App as AntdApp, Layout, Menu } from "antd";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import routerBindings, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router-v6";
import dataProvider from "@refinedev/simple-rest";
import { ColorModeContextProvider } from "./contexts/color-mode";
import Dashboard from "./components/Dashboard";
import {
  DashboardOutlined,
  BarChartOutlined,
  TransactionOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import AppHeader from "./components/header/Header"; // Import the custom Header

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
            <DevtoolsProvider>
              <Refine
                dataProvider={dataProvider("https://api.fake-rest.refine.dev")}
                notificationProvider={useNotificationProvider}
                routerProvider={routerBindings}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  useNewQueryKeys: true,
                  projectId: "wan3XL-jQqm2V-KLSpJ2",
                }}
              >
                <Layout style={{ minHeight: "100vh" }}>
                  {/* Sidebar */}
                  <Layout.Sider theme="dark">
                    <div
                      className="logo"
                      style={{
                        color: "white",
                        padding: "16px",
                        fontSize: "24px",
                      }}
                    >
                      Stock Tracker
                    </div>
                    <Menu theme="dark" defaultSelectedKeys={["dashboard"]} mode="inline">
                      <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
                        <a href="/">Dashboard</a>
                      </Menu.Item>
                      <Menu.Item key="portfolio" icon={<BarChartOutlined />}>
                        <a href="/portfolio">Portfolio</a>
                      </Menu.Item>
                      <Menu.Item key="transactions" icon={<TransactionOutlined />}>
                        <a href="/transactions">Transactions</a>
                      </Menu.Item>
                      <Menu.Item key="settings" icon={<SettingOutlined />}>
                        <a href="/settings">Settings</a>
                      </Menu.Item>
                    </Menu>
                  </Layout.Sider>

                  {/* Main Content */}
                  <Layout>
                    {/* Use Custom Header */}
                    <AppHeader /> 

                    <Layout.Content style={{ margin: "24px 16px 0" }}>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        {/* Add additional routes for portfolio, transactions, etc */}
                      </Routes>
                      <RefineKbar />
                      <UnsavedChangesNotifier />
                      <DocumentTitleHandler />
                    </Layout.Content>
                  </Layout>
                </Layout>
              </Refine>
              <DevtoolsPanel />
            </DevtoolsProvider>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;

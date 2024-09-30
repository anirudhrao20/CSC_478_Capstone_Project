import React, { useEffect, useState } from "react";
import { Layout, Card, Row, Col, Typography, Spin, Avatar } from "antd";
import { CaretUpOutlined, CaretDownOutlined } from "@ant-design/icons";
import { getMarketStatus, getCompanyProfile, getQuote } from "../services/api";

const { Text } = Typography;

const Dashboard: React.FC = () => {
  const [marketStatus, setMarketStatus] = useState<any>(null);
  const [trendingStocks, setTrendingStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const marketStatusRes = await getMarketStatus();
        setMarketStatus(marketStatusRes.data);

        const trendingSymbols = ["AAPL", "GOOGL", "TSLA", "AMZN", "NVDA"];
        const stocksData = await Promise.all(
          trendingSymbols.map(async (symbol) => {
            const [profile, quote] = await Promise.all([
              getCompanyProfile(symbol),
              getQuote(symbol),
            ]);
            return {
              symbol,
              name: profile.data.name,
              logo: profile.data.logo,
              price: quote.data.c,
              change: quote.data.dp,
            };
          })
        );
        setTrendingStocks(stocksData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <Layout.Content style={{ padding: "24px", backgroundColor: "#1D1F20" }}>
      <Row gutter={[16, 16]}>
        {/* Market Status */}
        <Col span={24}>
          <Card
            title="Market Status"
            style={{
              backgroundColor: "#171819",
              color: "white",
              borderRadius: "8px",
            }}
            headStyle={{
              backgroundColor: "#1e2a3a",
              color: "white",
              borderBottom: "none",
            }}
            bodyStyle={{ backgroundColor: "#1e2a3a" }}
          >
            <Text style={{ color: "white" }}>
              {marketStatus?.market === "open"
                ? "Market is Open"
                : "Market is Closed"}
            </Text>
          </Card>
        </Col>

        {/* Trending Stocks */}
        <Col span={24}>
          <Card
            title="Trending Stocks"
            style={{
              backgroundColor: "#171819",
              color: "white",
              borderRadius: "8px",
            }}
            headStyle={{
              backgroundColor: "#1e2a3a",
              color: "white",
              borderBottom: "none",
            }}
            bodyStyle={{ backgroundColor: "#1e2a3a", padding: "24px" }}
          >
            <Row gutter={[16, 16]}>
              {trendingStocks.map((stock) => (
                <Col key={stock.symbol} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    style={{
                      backgroundColor: "#2c3e50",
                      borderRadius: "8px",
                    }}
                    bodyStyle={{ padding: "16px" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <Avatar
                        src={stock.logo}
                        size="small"
                        style={{ marginRight: "8px" }}
                      />
                      <Text strong style={{ color: "white" }}>
                        {stock.symbol}
                      </Text>
                    </div>
                    <Text
                      type="secondary"
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        color: "#bdc3c7",
                      }}
                    >
                      {stock.name}
                    </Text>
                    <Text strong style={{ fontSize: "18px", color: "white" }}>
                      ${stock.price.toFixed(2)}
                    </Text>
                    <Text
                      style={{
                        marginLeft: "8px",
                        color: stock.change >= 0 ? "#2ecc71" : "#e74c3c",
                      }}
                    >
                      {stock.change >= 0 ? (
                        <CaretUpOutlined />
                      ) : (
                        <CaretDownOutlined />
                      )}
                      {Math.abs(stock.change).toFixed(2)}%
                    </Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* Portfolio Performance */}
        <Col span={16}>
          <Card
            title="Your Portfolio Performance"
            style={{
              backgroundColor: "#1e2a3a",
              color: "white",
              borderRadius: "8px",
              height: "300px",
            }}
            headStyle={{
              backgroundColor: "#1e2a3a",
              color: "white",
              borderBottom: "none",
            }}
            bodyStyle={{ backgroundColor: "#1e2a3a" }}
          >
            {/* Portfolio performance chart would go here */}
          </Card>
        </Col>

        {/* Saving Allocation */}
        <Col span={8}>
          <Card
            title="Saving Allocation"
            style={{
              backgroundColor: "#1e2a3a",
              color: "white",
              borderRadius: "8px",
              height: "300px",
            }}
            headStyle={{
              backgroundColor: "#1e2a3a",
              color: "white",
              borderBottom: "none",
            }}
            bodyStyle={{ backgroundColor: "#1e2a3a" }}
          >
            {/* Saving allocation chart would go here */}
          </Card>
        </Col>
      </Row>
    </Layout.Content>
  );
};

export default Dashboard;

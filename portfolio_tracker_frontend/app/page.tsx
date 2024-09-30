"use client";

import React from "react";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/table";

// Import the existing Navbar component

// Mock data for the dashboard
const accountBalance = 112893.0;
const stockData = [
  { symbol: "AAPL", name: "Apple Inc.", price: 150.25, change: 2.5 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 2750.5, change: -1.2 },
  { symbol: "MSFT", name: "Microsoft Corporation", price: 305.75, change: 0.8 },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 3380.2, change: 1.5 },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Main content */}
      <div className="flex pt-16">
        {" "}
        {/* Add padding-top to account for fixed navbar */}
        {/* Dashboard content */}
        <main className="flex-1 p-8 ml-64">
          {" "}
          {/* Add margin-left to account for sidebar */}
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Account Balance */}
            <Card>
              <CardHeader>Account Balance</CardHeader>
              <CardBody>
                <p className="text-2xl font-bold">
                  ${accountBalance.toLocaleString()}
                </p>
              </CardBody>
            </Card>

            {/* Stock Performance Chart (placeholder) */}
            <Card>
              <CardHeader>Stock Performance</CardHeader>
              <CardBody>
                <div className="h-64 bg-default-200 flex items-center justify-center">
                  Chart Placeholder
                </div>
              </CardBody>
            </Card>
          </div>
          {/* Stock Market Table */}
          <Card>
            <CardHeader>Stock Market</CardHeader>
            <CardBody>
              <Table aria-label="Stock market data">
                <TableHeader>
                  <TableColumn>SYMBOL</TableColumn>
                  <TableColumn>NAME</TableColumn>
                  <TableColumn>PRICE</TableColumn>
                  <TableColumn>CHANGE</TableColumn>
                </TableHeader>
                <TableBody>
                  {stockData.map((stock) => (
                    <TableRow key={stock.symbol}>
                      <TableCell>{stock.symbol}</TableCell>
                      <TableCell>{stock.name}</TableCell>
                      <TableCell>${stock.price.toFixed(2)}</TableCell>
                      <TableCell
                        className={
                          stock.change >= 0 ? "text-success" : "text-danger"
                        }
                      >
                        {stock.change > 0 ? "+" : ""}
                        {stock.change}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </main>
      </div>
    </div>
  );
}

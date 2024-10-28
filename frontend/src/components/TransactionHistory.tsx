import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip } from "@nextui-org/react";

interface Transaction {
  id: number;
  symbol: string;
  quantity: number;
  type: 'BUY' | 'SELL';
  price: number;
  timestamp: string;
}

export function TransactionHistory({ transactions }: { transactions: Transaction[] }) {
  // Sort transactions by timestamp in descending order (most recent first)
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Table aria-label="Transaction history">
      <TableHeader>
        <TableColumn>DATE</TableColumn>
        <TableColumn>SYMBOL</TableColumn>
        <TableColumn>TYPE</TableColumn>
        <TableColumn>QUANTITY</TableColumn>
        <TableColumn>PRICE</TableColumn>
      </TableHeader>
      <TableBody>
        {sortedTransactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>
              {new Date(transaction.timestamp).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <span className="font-medium">{transaction.symbol}</span>
            </TableCell>
            <TableCell>
              <Chip
                color={transaction.type === 'BUY' ? 'success' : 'danger'}
                variant="flat"
                size="sm"
              >
                {transaction.type}
              </Chip>
            </TableCell>
            <TableCell>{transaction.quantity}</TableCell>
            <TableCell>
              ${transaction.price ? transaction.price.toFixed(2) : '0.00'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

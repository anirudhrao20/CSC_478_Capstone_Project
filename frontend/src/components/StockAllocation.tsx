import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Chip } from "@nextui-org/react";
import { TrashIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { Stock } from '../types/portfolio';

interface StockAllocationProps {
  data: Stock[];
  onRemove?: (stockId: number) => void;
  onSell?: (symbol: string) => void;
}

export function StockAllocation({ data, onRemove, onSell }: StockAllocationProps) {
  return (
    <Table 
      aria-label="Stock allocation table"
      classNames={{
        th: "bg-default-100",
        td: "py-3"
      }}
    >
      <TableHeader>
        <TableColumn>STOCK</TableColumn>
        <TableColumn>METRICS</TableColumn>
        <TableColumn>QUANTITY</TableColumn>
        <TableColumn>VALUE</TableColumn>
        <TableColumn>ACTIONS</TableColumn>
      </TableHeader>
      <TableBody>
        {data.map((stock) => (
          <TableRow key={stock.symbol}>
            <TableCell>
              <div>
                <div className="font-bold">{stock.symbol}</div>
                <div className="text-sm text-default-500">
                  ${stock.currentPrice?.toFixed(2)}
                </div>
              </div>
            </TableCell>
            <TableCell>
              {stock.metrics ? (
                <div className="space-y-1">
                  <Chip
                    size="sm"
                    color={stock.metrics.percentChange >= 0 ? "success" : "danger"}
                    variant="flat"
                  >
                    {stock.metrics.percentChange >= 0 ? "+" : ""}
                    {stock.metrics.percentChange.toFixed(2)}%
                  </Chip>
                  <div className="text-xs text-default-500">
                    Vol: {(stock.metrics.volume / 1e6).toFixed(1)}M
                  </div>
                  <div className="text-xs text-default-500">
                    H: ${stock.metrics.high.toFixed(2)} L: ${stock.metrics.low.toFixed(2)}
                  </div>
                </div>
              ) : (
                <div className="text-default-400">Loading...</div>
              )}
            </TableCell>
            <TableCell>
              <span className="font-medium">{stock.quantity}</span>
            </TableCell>
            <TableCell>
              <span className="font-medium">
                ${(stock.value || 0).toLocaleString()}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                {onSell && (
                  <Button
                    color="success"
                    variant="light"
                    size="sm"
                    onPress={() => onSell(stock.symbol)}
                    startContent={<CurrencyDollarIcon className="h-4 w-4" />}
                  >
                    Transact
                  </Button>
                )}
                {onRemove && (
                  <Button
                    isIconOnly
                    color="danger"
                    variant="light"
                    size="sm"
                    onPress={() => onRemove(stock.id)}
                    startContent={<TrashIcon className="h-4 w-4" />}
                  >
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

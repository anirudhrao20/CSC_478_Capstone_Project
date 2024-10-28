import { Card, CardBody } from "@nextui-org/react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
}

export function MetricCard({ title, value, subtitle,}: MetricCardProps) {
  return (
    <Card>
      <CardBody className="text-center">
        <p className="text-default-500">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {subtitle && <p className="text-small text-default-400">{subtitle}</p>}
      </CardBody>
    </Card>
  );
}


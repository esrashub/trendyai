import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardMetricCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function DashboardMetricCard({
  icon: Icon,
  title,
  value,
  description,
  trend,
}: DashboardMetricCardProps) {
  return (
    <Card className="border border-border/50 bg-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          {trend && (
            <span
              className={`text-sm font-medium ${
                trend.isPositive ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {trend.isPositive ? "+" : "-"}
              {trend.value}%
            </span>
          )}
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

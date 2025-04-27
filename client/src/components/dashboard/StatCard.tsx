import { LucideIcon } from "lucide-react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  trend?: {
    value: number;
    label: string;
  };
};

const StatCard = ({
  title,
  value,
  subValue,
  icon: Icon,
  iconBgColor,
  iconColor,
  trend,
}: StatCardProps) => {
  const isTrendPositive = trend && trend.value > 0;
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-slate-500">{title}</h3>
          <p className="text-2xl font-semibold text-slate-800 mt-1">
            {value}
            {subValue && <span className="text-sm text-slate-500">{subValue}</span>}
          </p>
        </div>
        <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", iconBgColor)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>
      {trend && (
        <div className="mt-2 flex items-center text-sm">
          <span 
            className={cn(
              "flex items-center",
              isTrendPositive ? "text-primary" : "text-destructive"
            )}
          >
            {isTrendPositive ? (
              <ArrowUp className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDown className="h-4 w-4 mr-1" />
            )}
            <span>{isTrendPositive ? "+" : ""}{trend.value}</span>
          </span>
          <span className="text-slate-500 ml-1">{trend.label}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;

import { cn } from "../../utils/cn";

// This component acts as a placeholder when fetching data
export function Skeleton({ className = '', ...props }) {
  return (
    <div 
      className={cn(`animate-pulse bg-border rounded-md`, className)} 
      {...props}
    />
  );
}
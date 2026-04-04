
import { cn } from "@/lib/utils";

function PageHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-2 border-b pb-4", className)}
      {...props}
    />
  );
}

function PageHeaderTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        "text-3xl font-bold tracking-tight font-headline",
        className
      )}
      {...props}
    />
  );
}

function PageHeaderDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

export { PageHeader, PageHeaderTitle, PageHeaderDescription };

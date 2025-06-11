import { cn } from "@/lib/utils";
import { Table, TableHeader, TableRow, TableHead, TableBody } from "./table";

interface GlassTableWrapperProps {
  children: React.ReactNode;
  headers: string[];
}

export function GlassTableWrapper({ children, headers }: GlassTableWrapperProps) {
  return (
    <div className="rounded-lg overflow-hidden glass-card border border-border/20">
      <Table>
        <TableHeader className="bg-primary/5">
          <TableRow className="border-b-0">
            {headers.map((header, index) => (
              <TableHead key={index}>{header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>{children}</TableBody>
      </Table>
    </div>
  );
} 
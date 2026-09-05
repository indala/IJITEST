import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface ReviewsFilterBarProps {
    searchQuery: string;
    onSearchQueryChange: (val: string) => void;
    statusFilter: string;
    onStatusFilterChange: (val: string) => void;
}

export function ReviewsFilterBar({
    searchQuery,
    onSearchQueryChange,
    statusFilter,
    onStatusFilterChange,
}: ReviewsFilterBarProps) {
    return (
        <div className="flex flex-col md:flex-row items-center gap-6 bg-muted/20 p-8 rounded-2xl border border-border/50">
            <div className="relative flex-1 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Search by manuscript ID or title..."
                    value={searchQuery}
                    onChange={(e) => onSearchQueryChange(e.target.value)}
                    className="h-14 pl-14 pr-6 bg-card border-border/50 rounded-xl text-base font-medium focus:ring-4 focus:ring-primary/10 transition-all w-full"
                />
            </div>
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger className="h-14 px-8 bg-card border-border/50 rounded-xl text-xs font-bold uppercase tracking-widest text-primary min-w-[240px]">
                    <SelectValue placeholder="System Filter" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border bg-card">
                    <SelectItem value="all" className="font-bold text-xs uppercase tracking-widest">All Records</SelectItem>
                    <SelectItem value="assigned" className="font-bold text-xs uppercase tracking-widest">Pending Evaluation</SelectItem>
                    <SelectItem value="completed" className="font-bold text-xs uppercase tracking-widest">Audit Completed</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}

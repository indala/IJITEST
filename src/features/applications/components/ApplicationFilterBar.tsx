import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ApplicationFilterBarProps {
    interest: string;
    role: string;
    status: string;
    onFilterChange: (filters: { interest?: string; role?: string; status?: string }) => void;
}

export function ApplicationFilterBar({
    interest,
    role,
    status,
    onFilterChange,
}: ApplicationFilterBarProps) {
    return (
        <div className="flex flex-col sm:flex-row items-center gap-4 max-w-4xl">
            <div className="relative group flex-1 w-full">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Search candidates by name or domain..."
                    value={interest}
                    onChange={(e) => onFilterChange({ interest: e.target.value })}
                    className="h-14 pl-14 bg-primary/5 border-none font-semibold text-sm rounded-2xl focus-visible:ring-4 focus-visible:ring-primary/5"
                />
            </div>
            <Select value={role} onValueChange={(val) => onFilterChange({ role: val })}>
                <SelectTrigger className="h-14 bg-primary/5 border-none font-semibold text-sm rounded-2xl px-6 min-w-[160px]">
                    <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-primary/5 bg-card">
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="reviewer">Reviewer</SelectItem>
                </SelectContent>
            </Select>
            <Select value={status} onValueChange={(val) => onFilterChange({ status: val })}>
                <SelectTrigger className="h-14 bg-primary/5 border-none font-semibold text-sm rounded-2xl px-6 min-w-[160px]">
                    <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-primary/5 bg-card">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}

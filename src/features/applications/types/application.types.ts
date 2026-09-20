import type {
    Application,
    ApplicationStatus,
    ApplicationType,
} from "@/db/types";

export interface ApplicationFilters {
    role?: ApplicationType | "all";
    status?: ApplicationStatus | "all";
    interest?: string;
}

export type { Application };

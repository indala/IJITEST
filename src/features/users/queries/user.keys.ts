export const userKeys = {
    all: ["users"] as const,
    list: (role?: string) => [...userKeys.all, role ?? "all"] as const,
};

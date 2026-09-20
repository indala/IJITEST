export const notificationKeys = {
    all: ["notifications"] as const,
    counts: () => [...notificationKeys.all, "counts"] as const,
};

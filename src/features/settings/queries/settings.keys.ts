export const settingsKeys = {
    all: ["settings"] as const,
    public: () => ["public"] as const,
    publications: () => ["publications"] as const,
};

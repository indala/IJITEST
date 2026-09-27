type SearchableApplication = {
    fullName: string;
    email: string;
    researchInterests?: readonly string[] | undefined;
};

export function filterApplications<T extends SearchableApplication>(
    applications: readonly T[],
    interest: string,
): T[] {
    const query = interest.trim().toLowerCase();
    if (!query) return [...applications];

    return applications.filter((application) =>
        application.fullName.toLowerCase().includes(query) ||
        application.email.toLowerCase().includes(query) ||
        application.researchInterests?.some((value) =>
            value.toLowerCase().includes(query),
        ),
    );
}

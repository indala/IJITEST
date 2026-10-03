import ApplicationsRegistry from '@/features/applications/components/ApplicationsRegistry';

export const metadata = {
    title: "Reviewer Applications",
};

export default function ManageApplicationsPage() {
    return <ApplicationsRegistry role="editor" />;
}

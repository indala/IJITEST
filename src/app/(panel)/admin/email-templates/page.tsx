import EmailTemplatesManager from './EmailTemplatesManager';

export const metadata = {
    title: "Email Templates",
    description: "Manage automated scholarly notification email templates, layout styling, and placeholder tokens.",
};

export default function AdminEmailTemplatesPage() {
    return (
        <div className="space-y-6">
            <EmailTemplatesManager />
        </div>
    );
}

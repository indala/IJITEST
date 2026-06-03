import { ReviewsRegistry } from '@/features/reviews/components/ReviewsRegistry';

export const metadata = {
    title: "Reviews | IJITEST",
};

export default function AdminReviews() {
    return <ReviewsRegistry role="admin" />;
}

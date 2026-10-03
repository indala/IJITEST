import { ReviewsRegistry } from '@/features/reviews/components/ReviewsRegistry';

export const metadata = {
    title: "Peer Reviews",
};

export default function AdminReviews() {
    return <ReviewsRegistry role="admin" />;
}

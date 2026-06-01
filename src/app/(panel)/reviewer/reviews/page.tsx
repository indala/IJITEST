'use client'

export const metadata = {
    title: "Reviews | IJITEST",
};

import { ReviewsRegistry } from '@/features/reviews/components/ReviewsRegistry';

export default function ReviewerReviews() {
    return <ReviewsRegistry role="reviewer" />;
}

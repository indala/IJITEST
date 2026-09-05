"use client";

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-4xl font-bold">Something went wrong</h1>
        <p className="max-w-md text-gray-600">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="mt-4 btn-primary px-6"
        >
          Try again
        </button>
      </body>
    </html>
  );
}

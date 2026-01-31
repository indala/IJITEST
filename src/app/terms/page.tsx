export default function TermsAndConditions() {
    return (
        <div className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-serif font-black mb-8 border-l-4 border-secondary pl-6 text-primary uppercase">Terms & Conditions</h1>

                <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
                    <section>
                        <h2 className="text-2xl font-serif font-bold text-primary mb-4">Website Usage Policy</h2>
                        <p>
                            By accessing this website, users agree to comply with the terms of use and all applicable laws and regulations. The content of this website is the property of Felix Academic Publications and is protected by copyright laws.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif font-bold text-primary mb-4">Disclaimer</h2>
                        <p>
                            The opinions expressed in the articles are those of the authors and do not necessarily reflect the views of the editorial board or the publisher. IJITEST is not responsible for any inaccuracies or errors in the published content.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

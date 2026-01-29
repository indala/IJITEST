import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
    return (
        <div className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-serif font-black mb-4 border-l-4 border-secondary pl-6 text-primary">Contact Us</h1>
                <p className="text-gray-500 mb-16 text-lg">We are here to help you with any queries regarding your submission.</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Contact Information */}
                    <div className="space-y-12">
                        <div className="grid gap-8">
                            <div className="flex gap-6">
                                <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-1">Email Support</h3>
                                    <p className="text-gray-600 mb-2">General Queries: editor@ijitest.com</p>
                                    <p className="text-gray-600">Technical Support: support@ijitest.com</p>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-1">Phone</h3>
                                    <p className="text-gray-600 mb-2">+91 XXXXXXXXXX</p>
                                    <p className="text-gray-600">Office Hours: 09:00 AM - 06:00 PM IST</p>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold mb-1">Editorial Office</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        IJITEST Journal Office,<br />
                                        Innovation Park, Tech Hub District,<br />
                                        Maharashtra, India
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-secondary/5 p-8 rounded-[2rem] border border-secondary/10">
                            <h3 className="text-xl font-bold font-serif text-secondary mb-4">Urgent Matters?</h3>
                            <p className="text-gray-600 text-sm">
                                If you have an urgent inquiry regarding a published paper or a pending payment, please include your <strong>Paper ID</strong> in the subject line of your email.
                            </p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-gray-50 p-10 rounded-[2.5rem] border border-gray-100">
                        <h3 className="text-2xl font-bold font-serif mb-8 text-gray-900">Send us a message</h3>
                        <form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="John Doe" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="john@example.com" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <input className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" placeholder="How can we help?" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea rows={5} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none" placeholder="Enter your query here..."></textarea>
                            </div>
                            <button className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-3 text-lg font-bold shadow-lg shadow-primary/20">
                                Send Message <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

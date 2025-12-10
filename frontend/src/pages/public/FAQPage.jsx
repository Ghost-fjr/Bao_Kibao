import { Link } from 'react-router-dom';

const FAQPage = () => {
    const faqs = [
        {
            question: "How do I register for a tournament?",
            answer: "Create an account, navigate to the Tournaments page, select your desired tournament, and click 'Register Team'. You'll need to provide team details and pay the registration fee.",
            icon: "⚽"
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards, debit cards, and digital payment methods through our secure Stripe payment gateway.",
            icon: "💳"
        },
        {
            question: "Can I get a refund if my team withdraws?",
            answer: "Refunds are available up to 7 days before the tournament start date. After that, registration fees are non-refundable unless the tournament is cancelled.",
            icon: "💰"
        },
        {
            question: "How many players can be on a team?",
            answer: "Team size varies by sport. Football teams can have 7-15 players, basketball teams 5-12 players, and volleyball teams 6-12 players.",
            icon: "👥"
        },
        {
            question: "Do you provide equipment?",
            answer: "Teams must bring their own uniforms and personal equipment. Match balls and field equipment are provided by the organization.",
            icon: "🎽"
        },
        {
            question: "How do I purchase merchandise?",
            answer: "Browse our Store page, add items to your cart, and proceed to checkout. You'll need to create an account to complete your purchase.",
            icon: "🛍️"
        },
        {
            question: "How long does shipping take?",
            answer: "Standard shipping takes 5-7 business days. Express shipping (2-3 days) is available for an additional fee.",
            icon: "📦"
        },
        {
            question: "Can I donate to support your programs?",
            answer: "Yes! Visit our Donate page to make a contribution. All donations go directly to supporting Gaza relief and community programs.",
            icon: "❤️"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50/60 overflow-hidden font-sans selection:bg-accent-red selection:text-white">
            {/* Background Elements - Palestinian Flag Colors */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-green/50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-red/50 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-accent-black/30 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="inline-block py-1 px-3 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold tracking-wide uppercase mb-4 shadow-sm">
                        Help Center
                    </span>
                    <h1 className="text-5xl md:text-6xl font-black text-gray-900 tracking-tight mb-6">
                        Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-red to-primary-600">Questions</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-gray-600 font-light">
                        Find answers to common questions about tournaments, payments, and our mission.
                    </p>
                </div>

                {/* FAQ Grid */}
                <div className="grid gap-6 mb-12">
                    {faqs.map((faq, index) => (
                        <div key={index} className="group relative">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-red via-accent-black to-accent-green rounded-3xl opacity-10 group-hover:opacity-20 transition duration-500 blur"></div>
                            <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-accent-red to-primary-600 rounded-2xl flex items-center justify-center text-2xl mr-4 group-hover:scale-110 transition-transform duration-300">
                                        {faq.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">{faq.question}</h3>
                                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact CTA */}
                <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-green to-emerald-600 rounded-3xl opacity-30 group-hover:opacity-50 transition duration-500 blur"></div>
                    <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/20 text-center">
                        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Still have questions?</h2>
                        <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
                            Can't find the answer you're looking for? Our support team is here to help you.
                        </p>
                        <Link
                            to="/contact"
                            className="inline-block px-10 py-4 bg-gradient-to-r from-accent-green to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;


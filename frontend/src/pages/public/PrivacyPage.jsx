const PrivacyPage = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>

            <div className="card space-y-6">
                <div>
                    <p className="text-sm text-gray-500 mb-4">Last updated: November 29, 2025</p>
                    <p className="text-gray-700">
                        Bao Kibao ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-3">Information We Collect</h2>
                    <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
                    <p className="text-gray-700 mb-2">We collect information that you provide directly to us, including:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                        <li>Name, email address, and contact information</li>
                        <li>Account credentials</li>
                        <li>Payment information (processed securely through Stripe)</li>
                        <li>Team and player information for tournament registration</li>
                        <li>Shipping address for merchandise orders</li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2">Automatically Collected Information</h3>
                    <p className="text-gray-700 mb-2">When you use our platform, we automatically collect:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                        <li>Device information and IP address</li>
                        <li>Browser type and version</li>
                        <li>Usage data and analytics</li>
                        <li>Cookies and similar tracking technologies</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-3">How We Use Your Information</h2>
                    <p className="text-gray-700 mb-2">We use the information we collect to:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                        <li>Process tournament registrations and merchandise orders</li>
                        <li>Communicate with you about your account and transactions</li>
                        <li>Send you updates about tournaments and events</li>
                        <li>Improve our platform and user experience</li>
                        <li>Prevent fraud and ensure platform security</li>
                        <li>Comply with legal obligations</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-3">Information Sharing</h2>
                    <p className="text-gray-700 mb-2">We do not sell your personal information. We may share your information with:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                        <li>Service providers (payment processors, shipping companies)</li>
                        <li>Tournament organizers (for registered participants)</li>
                        <li>Legal authorities when required by law</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-3">Data Security</h2>
                    <p className="text-gray-700">
                        We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-3">Your Rights</h2>
                    <p className="text-gray-700 mb-2">You have the right to:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                        <li>Access and update your personal information</li>
                        <li>Request deletion of your account and data</li>
                        <li>Opt-out of marketing communications</li>
                        <li>Object to certain data processing activities</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-3">Cookies</h2>
                    <p className="text-gray-700">
                        We use cookies and similar technologies to enhance your experience, analyze usage, and deliver personalized content. You can control cookies through your browser settings.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-3">Children's Privacy</h2>
                    <p className="text-gray-700">
                        Our platform is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-3">Changes to This Policy</h2>
                    <p className="text-gray-700">
                        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
                    </p>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-3">Contact Us</h2>
                    <p className="text-gray-700">
                        If you have questions about this Privacy Policy, please contact us at:
                    </p>
                    <p className="text-gray-700 mt-2">
                        Email: privacy@baokibao.org<br />
                        Address: 123 Sports Avenue, Community Center, Suite 100, City, State 12345
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;


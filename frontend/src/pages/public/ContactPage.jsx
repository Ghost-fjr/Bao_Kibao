const ContactPage = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Contact Us</h1>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="card">
                    <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-gray-900">Email</h3>
                            <p className="text-gray-600">info@baokibao.org</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Phone</h3>
                            <p className="text-gray-600">+1 (555) 123-4567</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Address</h3>
                            <p className="text-gray-600">
                                123 Sports Avenue<br />
                                Community Center, Suite 100<br />
                                City, State 12345
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Office Hours</h3>
                            <p className="text-gray-600">
                                Monday - Friday: 9:00 AM - 5:00 PM<br />
                                Saturday: 10:00 AM - 2:00 PM<br />
                                Sunday: Closed
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h2 className="text-2xl font-bold mb-4">Send Us a Message</h2>
                    <form className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input type="text" className="input-field" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input type="email" className="input-field" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Subject</label>
                            <input type="text" className="input-field" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Message</label>
                            <textarea className="input-field" rows="4" required></textarea>
                        </div>
                        <button type="submit" className="btn-primary w-full">
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;


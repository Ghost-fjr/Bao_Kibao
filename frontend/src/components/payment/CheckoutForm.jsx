import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';

const CheckoutForm = ({ clientSecret, totalAmount }) => {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();

    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/dashboard/orders`,
            },
        });

        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message);
        } else {
            setMessage("An unexpected error occurred.");
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md mb-4">
                <p className="text-sm text-gray-500">Total to pay</p>
                <p className="text-2xl font-bold text-gray-900">Ksh {totalAmount}</p>
            </div>

            <PaymentElement id="payment-element" />

            <button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="w-full btn-primary mt-4"
            >
                <span id="button-text">
                    {isLoading ? "Processing..." : "Pay now"}
                </span>
            </button>

            {message && <div id="payment-message" className="text-red-500 text-sm mt-2">{message}</div>}
        </form>
    );
};

export default CheckoutForm;

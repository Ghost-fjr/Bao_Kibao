import { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    return (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded shadow-lg text-white transition-opacity duration-300 z-50 ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}>
            <div className="flex items-center">
                <span className="mr-2">
                    {type === 'success' && '✓'}
                    {type === 'error' && '✕'}
                    {type === 'info' && 'ℹ'}
                </span>
                {message}
                <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
                    ×
                </button>
            </div>
        </div>
    );
};

export default Toast;

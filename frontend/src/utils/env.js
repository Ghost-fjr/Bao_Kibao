/**
 * Environment Validation
 * Ensures that all required environment variables are present at startup.
 */

const requiredEnvs = [
    'VITE_API_URL',
    'VITE_STRIPE_PUBLIC_KEY',
];

export const validateEnv = () => {
    const missing = [];
    
    for (const env of requiredEnvs) {
        if (!import.meta.env[env]) {
            missing.push(env);
        }
    }

    if (missing.length > 0) {
        console.warn(`[Env Validation] Missing required environment variables: ${missing.join(', ')}`);
        // We do not throw an error because in some build environments, env vars might be injected differently
        // but this is highly useful for developers to see immediately in the console.
    } else {
        console.log('[Env Validation] All required environment variables are present.');
    }
};

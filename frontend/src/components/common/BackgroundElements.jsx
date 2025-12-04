import React from 'react';

const BackgroundElements = () => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Bouncing Hearts */}
            <svg className="absolute top-20 right-20 w-16 h-16 text-accent-red opacity-30 animate-bounce" style={{ animationDuration: '2s' }} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <svg className="absolute bottom-1/3 left-16 w-20 h-20 text-accent-green opacity-25 animate-bounce" style={{ animationDuration: '3s' }} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>

            {/* Special Tricolor Flag Heart - Gigantic & Aesthetic */}
            <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] animate-bounce opacity-5" style={{ animationDuration: '10s' }} viewBox="0 0 100 100">
                <defs>
                    <clipPath id="heart-clip-bg">
                        <path d="M50 90 C10 70 0 40 0 25 C0 10 15 0 35 0 C45 0 50 10 50 10 C50 10 55 0 65 0 C85 0 100 10 100 25 C100 40 90 70 50 90 Z" />
                    </clipPath>
                </defs>
                <g clipPath="url(#heart-clip-bg)">
                    <rect width="100" height="33" y="0" fill="#000000" />
                    <rect width="100" height="34" y="33" fill="#FFFFFF" />
                    <rect width="100" height="33" y="67" fill="#009736" />
                    <path d="M0 0 L50 50 L0 100 Z" fill="#EE2A35" />
                </g>
            </svg>

            {/* Palestinian Flags */}
            <svg className="absolute top-40 left-10 w-24 h-24 text-accent-red opacity-20" viewBox="0 0 100 60">
                <rect x="0" y="0" width="100" height="20" fill="#000000" />
                <rect x="0" y="20" width="100" height="20" fill="#FFFFFF" />
                <rect x="0" y="40" width="100" height="20" fill="#009736" />
                <polygon points="0,0 0,60 40,30" fill="#EE2A35" opacity="0.9" />
            </svg>
            <svg className="absolute bottom-20 right-32 w-20 h-20 text-accent-green opacity-20 animate-pulse" viewBox="0 0 100 60">
                <rect x="0" y="0" width="100" height="20" fill="#000000" />
                <rect x="0" y="20" width="100" height="20" fill="#FFFFFF" />
                <rect x="0" y="40" width="100" height="20" fill="#009736" />
                <polygon points="0,0 0,60 40,30" fill="#EE2A35" opacity="0.9" />
            </svg>

            {/* Stars */}
            <svg className="absolute top-1/3 right-40 w-14 h-14 text-accent-red opacity-20 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <svg className="absolute bottom-1/4 left-1/3 w-12 h-12 text-accent-green opacity-15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>

            {/* Palestinian Watermelons */}
            <svg className="absolute top-1/2 right-12 w-22 h-22 text-accent-red opacity-20" viewBox="0 0 100 100">
                <path d="M50 10 Q80 10 90 40 Q90 70 50 90 Q10 70 10 40 Q20 10 50 10 Z" fill="#009736" />
                <path d="M50 20 Q75 20 83 40 Q83 65 50 80 Q17 65 17 40 Q25 20 50 20 Z" fill="#EE2A35" />
                <path d="M50 30 Q70 30 76 40 Q76 60 50 70 Q24 60 24 40 Q30 30 50 30 Z" fill="#FFFFFF" />
                <circle cx="35" cy="45" r="2" fill="#000000" />
                <circle cx="50" cy="50" r="2" fill="#000000" />
                <circle cx="65" cy="45" r="2" fill="#000000" />
            </svg>
            <svg className="absolute bottom-40 left-20 w-20 h-20 text-accent-green opacity-25" viewBox="0 0 100 100">
                <path d="M50 10 Q80 10 90 40 Q90 70 50 90 Q10 70 10 40 Q20 10 50 10 Z" fill="#009736" />
                <path d="M50 20 Q75 20 83 40 Q83 65 50 80 Q17 65 17 40 Q25 20 50 20 Z" fill="#EE2A35" />
                <path d="M50 30 Q70 30 76 40 Q76 60 50 70 Q24 60 24 40 Q30 30 50 30 Z" fill="#FFFFFF" />
                <circle cx="40" cy="45" r="1.5" fill="#000000" />
                <circle cx="55" cy="48" r="1.5" fill="#000000" />
            </svg>

            {/* Palestine Map with Flag Fill - Improved Outline */}
            <svg className="absolute top-1/2 right-10 w-32 h-40 opacity-20" viewBox="0 0 200 400">
                <defs>
                    <linearGradient id="flagGradientMap" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="33%" stopColor="#000000" />
                        <stop offset="33%" stopColor="#FFFFFF" />
                        <stop offset="66%" stopColor="#FFFFFF" />
                        <stop offset="66%" stopColor="#009736" />
                    </linearGradient>
                </defs>
                {/* Approximate path for Historic Palestine */}
                <path d="M 60,10 C 70,5 90,5 100,10 C 110,15 115,25 110,40 C 105,50 110,60 115,70 C 120,80 115,90 110,100 C 105,110 100,120 95,130 C 90,140 85,150 80,160 C 75,170 70,180 65,190 C 60,200 55,210 50,220 C 45,230 40,240 35,250 C 30,260 25,270 20,280 C 15,290 10,300 15,310 C 20,320 30,330 40,340 C 50,350 60,360 70,370 L 60,380 C 50,370 40,360 30,350 C 20,340 10,330 5,320 C 0,310 5,300 10,290 C 15,280 20,270 25,260 C 30,250 35,240 40,230 L 30,220 C 25,210 20,200 15,190 C 10,180 5,170 10,160 C 15,150 20,140 25,130 C 30,120 35,110 40,100 C 45,90 50,80 55,70 C 60,60 55,50 50,40 C 45,30 50,20 60,10 Z"
                    fill="url(#flagGradientMap)" stroke="none" transform="scale(1.5) translate(20,0)" />
                {/* Simplified artistic representation since exact path is hard without SVG file */}
                <path d="M70 20 L 90 20 L 100 40 L 90 60 L 85 80 L 80 120 L 70 160 L 60 200 L 50 240 L 40 280 L 30 320 L 40 340 L 20 360 L 10 320 L 20 280 L 30 240 L 40 200 L 50 160 L 60 120 L 65 80 L 60 60 L 50 40 L 70 20 Z"
                    fill="url(#flagGradientMap)" stroke="none" opacity="0.8" />
            </svg>

            <svg className="absolute top-1/3 left-24 w-28 h-36 opacity-20" viewBox="0 0 200 400">
                <path d="M70 20 L 90 20 L 100 40 L 90 60 L 85 80 L 80 120 L 70 160 L 60 200 L 50 240 L 40 280 L 30 320 L 40 340 L 20 360 L 10 320 L 20 280 L 30 240 L 40 200 L 50 160 L 60 120 L 65 80 L 60 60 L 50 40 L 70 20 Z"
                    fill="url(#flagGradientMap)" stroke="none" opacity="0.8" />
            </svg>
        </div>
    );
};

export default BackgroundElements;

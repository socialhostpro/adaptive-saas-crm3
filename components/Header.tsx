import React, { useState, useEffect } from 'react';
import { APP_CONFIG } from '../config/constants';

interface HeaderProps {
    setIsSidebarOpen: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setIsSidebarOpen }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        // Check initial theme
        const isDark = document.documentElement.classList.contains('dark');
        setIsDarkMode(isDark);

        // Watch for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const isDark = document.documentElement.classList.contains('dark');
                    setIsDarkMode(isDark);
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, []);

    // Always use dark logo
    const logoSrc = APP_CONFIG.LOGOS.DARK_MODE;

    return (
        <header className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center sticky top-0 z-30 md:hidden">
            {/* Left side - Logo and brand (only visible on mobile) */}
            <div className="flex items-center">
                <img 
                    src={`${logoSrc}?v=${Date.now()}`}
                    alt="SaaS Logo" 
                    className="h-8 w-auto mr-3"
                    onError={(e) => {
                        console.warn('Logo failed to load, using fallback');
                        e.currentTarget.src = APP_CONFIG.LOGOS.FAVICON;
                    }}
                />
                <h1 className="text-lg font-bold tracking-tight text-gray-800 dark:text-gray-200">{APP_CONFIG.COMPANY_NAME}</h1>
            </div>

            {/* Right side - Menu button for mobile */}
            <button
                onClick={() => setIsSidebarOpen(true)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                aria-label="Open sidebar"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
        </header>
    );
};

export default Header;

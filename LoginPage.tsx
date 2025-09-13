import React, { useEffect, useRef } from 'react';
import type { User } from './types';
import { GOOGLE_CLIENT_ID } from './config';
import { StethoscopeIcon, SunIcon, MoonIcon } from './components/icons';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

// FIX: Declare the 'google' global variable provided by the Google Identity Services script.
// This resolves the "Cannot find name 'google'" TypeScript errors.
declare const google: any;

// Function to decode JWT manually
const decodeJwt = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error decoding JWT", e);
    return null;
  }
};

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, isDarkMode, onThemeToggle }) => {
  const signInDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleCredentialResponse = (response: any) => {
      const decoded = decodeJwt(response.credential);
      if (decoded) {
        // Sanitize the picture URL from Google to get a higher-resolution image
        // by removing any size parameters (e.g., '=s96-c').
        const pictureUrl = decoded.picture ? decoded.picture.split('=')[0] : '';
        
        const user: User = {
          id: decoded.sub,
          name: decoded.name,
          email: decoded.email,
          picture: pictureUrl,
        };
        onLoginSuccess(user);
      }
    };

    const initializeAndRenderButton = () => {
      if (!signInDivRef.current) return;
      try {
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          use_fedcm_for_prompt: false,
        });

        google.accounts.id.renderButton(
          signInDivRef.current,
          { theme: "outline", size: "large", type: "standard", text: "signin_with" }
        );
        
        google.accounts.id.prompt();
      } catch (error) {
          console.error("Error initializing Google Sign-In:", error);
      }
    };
    
    // Use an interval to check for the 'google' object from the async script.
    // This prevents a race condition on initial page load.
    const intervalId = setInterval(() => {
      if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
        clearInterval(intervalId);
        initializeAndRenderButton();
      }
    }, 100);

    return () => {
      clearInterval(intervalId);
    };
  }, [onLoginSuccess]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background-primary p-4 relative">
      <div className="absolute top-4 right-4">
        <button
          onClick={onThemeToggle}
          className="p-2 rounded-full text-text-secondary hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
        </button>
      </div>

      <div className="w-full max-w-md text-center">
        <header className="mb-8">
            <div className="flex items-center justify-center mb-2">
                <StethoscopeIcon className="h-12 w-12 text-accent-primary" />
                <h1 className="text-5xl font-extrabold text-text-primary ml-3">
                    Symptom AI
                </h1>
            </div>
            <p className="text-lg text-text-secondary mt-2">
                Sign in to access your personalized diagnosis assistant.
            </p>
        </header>
        <main className="bg-background-secondary rounded-xl shadow-2xl p-8 border border-border-primary">
            <h2 className="text-xl font-semibold text-text-primary mb-2">Welcome</h2>
            <p className="text-text-secondary mb-6">Please sign in with your Google account to continue.</p>
            <div ref={signInDivRef} className="flex justify-center"></div>
             {GOOGLE_CLIENT_ID.startsWith('YOUR_') && (
                <div className="mt-6 text-xs text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-lg border border-yellow-200 dark:border-yellow-500/30">
                    <strong>Developer Note:</strong> Google Sign-In is not configured. Please add your Google Client ID in <code>config.ts</code> to enable login.
                </div>
            )}
        </main>
        <footer className="mt-8 text-xs text-slate-400 dark:text-slate-500">
             <p>Your privacy is important. We only use your basic profile information for display and to save your analysis history securely.</p>
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;
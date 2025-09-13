import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Analyzing symptoms...",
  "Consulting medical knowledge base...",
  "Cross-referencing datasets...",
  "Formulating potential diagnoses...",
  "Considering differential factors...",
  "Finalizing recommendations...",
];

const LoadingIndicator: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="text-center p-8 flex flex-col items-center justify-center">
      <div className="flex items-center justify-center space-x-2">
        <div className="w-4 h-4 rounded-full bg-accent-primary animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-4 h-4 rounded-full bg-accent-primary animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-4 h-4 rounded-full bg-accent-primary animate-pulse"></div>
      </div>
      <p className="mt-4 text-text-secondary transition-all duration-300">
        {loadingMessages[messageIndex]}
      </p>
    </div>
  );
};

export default LoadingIndicator;
import React, { useState, useEffect, useRef } from 'react';
import type { AnalysisResult, ChatMessage } from '../types';
import { MessageSquareIcon, SendIcon, StethoscopeIcon } from './icons';

const FIREWORKS_API_KEY = 'fw_3ZJFsKcfEZdwevp1jMnXxmJL';
const FIREWORKS_MODEL = 'accounts/sentientfoundation/models/dobby-unhinged-llama-3-3-70b-new';
const API_URL = 'https://api.fireworks.ai/inference/v1/chat/completions';

interface ChatComponentProps {
    analysisResult: AnalysisResult;
    symptoms: string;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ analysisResult, symptoms }) => {
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const initialContext: ChatMessage[] = [
            {
                role: 'user',
                parts: [{ text: `Here is my initial analysis request. Symptoms: "${symptoms}". Please answer my follow-up questions based on this and the analysis you provided.` }]
            },
            {
                role: 'model',
                parts: [{ text: `Of course. I have reviewed the analysis based on the symptoms: "${symptoms}". The top potential diagnoses were: ${analysisResult.differentialDiagnosis.map(d => d.condition).join(', ')}. I am ready to answer your follow-up questions. Please remember this is for informational purposes only.` }]
            }
        ];
        setHistory(initialContext);
    }, [analysisResult, symptoms]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isLoading]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const newUserMessage: ChatMessage = { role: 'user', parts: [{ text: userInput }] };
        const currentHistory = [...history, newUserMessage];
        setHistory(currentHistory);
        setIsLoading(true);
        setUserInput('');
        
        try {
            const formattedHistory = currentHistory.map(msg => ({
                role: msg.role,
                content: msg.parts[0].text
            }));

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${FIREWORKS_API_KEY}`,
                },
                body: JSON.stringify({
                    model: FIREWORKS_MODEL,
                    messages: formattedHistory,
                    stream: true,
                }),
            });

            if (!response.ok || !response.body) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let modelResponse = '';
            setHistory(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.substring(6).trim();
                        if (data === '[DONE]') break;
                        try {
                            const parsed = JSON.parse(data);
                            const delta = parsed.choices[0]?.delta?.content;
                            if (delta) {
                                modelResponse += delta;
                                setHistory(prev => {
                                    const newHistory = [...prev];
                                    newHistory[newHistory.length - 1] = { role: 'model', parts: [{ text: modelResponse }] };
                                    return newHistory;
                                });
                            }
                        } catch (error) {
                            // Ignore incomplete JSON chunks
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setHistory(prev => [...prev, { role: 'model', parts: [{ text: "Sorry, I encountered an error. Please try again." }] }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-background-secondary p-5 rounded-xl shadow-lg border border-border-primary no-print">
            <div className="flex items-center mb-4">
                <MessageSquareIcon className="h-6 w-6 text-accent-primary" />
                <h3 className="text-lg font-bold text-text-primary ml-3">Follow-up Questions</h3>
            </div>
            
            <div className="h-80 flex flex-col bg-background-primary rounded-lg border border-border-primary p-4">
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                   {history.slice(2).map((msg, index) => (
                       <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center"><StethoscopeIcon className="h-5 w-5 text-accent-primary" /></div>}
                            <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-accent-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-text-primary'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.parts[0].text}</p>
                            </div>
                       </div>
                   ))}
                   {isLoading && history[history.length - 1].role === 'user' && (
                       <div className="flex items-start gap-3">
                           <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center"><StethoscopeIcon className="h-5 w-5 text-accent-primary" /></div>
                           <div className="max-w-md p-3 rounded-lg bg-slate-200 dark:bg-slate-700 text-text-primary">
                                <div className="flex items-center justify-center space-x-1">
                                    <div className="w-2 h-2 rounded-full bg-text-secondary animate-pulse [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 rounded-full bg-text-secondary animate-pulse [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 rounded-full bg-text-secondary animate-pulse"></div>
                                </div>
                           </div>
                       </div>
                   )}
                   <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-2">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Ask a question about your results..."
                        disabled={isLoading}
                        className="flex-1 p-2 border border-border-primary rounded-lg bg-background-secondary text-text-primary focus:ring-2 focus:ring-accent-primary focus:border-accent-primary transition-shadow"
                    />
                    <button type="submit" disabled={isLoading || !userInput.trim()} className="p-3 bg-accent-primary text-white rounded-lg hover:bg-accent-primary-hover disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors">
                        <SendIcon className="h-5 w-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatComponent;
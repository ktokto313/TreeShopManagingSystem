import { useState, useRef, useEffect } from 'react';
import { sendMessage, getChatHistory, clearChatHistory } from './api/chatApi';
import { X, Send, Trash2, MessageCircle, Minimize2 } from 'lucide-react';

const CHATBOT_NAME = 'TreeShop Assistant';

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(() => localStorage.getItem('chatSessionId') || null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (sessionId) {
            loadHistory();
        }
    }, [sessionId]);

    useEffect(() => {
        if (isOpen && !isMinimized) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            inputRef.current?.focus();
        }
    }, [messages, isOpen, isMinimized]);

    const loadHistory = async () => {
        if (!sessionId) return;
        try {
            const data = await getChatHistory(sessionId);
            if (data.history) {
                const formattedMessages = data.history.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content
                }));
                setMessages(formattedMessages);
            }
        } catch (err) {
            console.error('Failed to load history:', err);
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const data = await sendMessage(userMessage, sessionId);
            
            if (!sessionId || sessionId !== data.sessionId) {
                setSessionId(data.sessionId);
                localStorage.setItem('chatSessionId', data.sessionId);
            }
            
            setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
        } catch (err) {
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: 'Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.' 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = async () => {
        if (!sessionId) return;
        try {
            await clearChatHistory(sessionId);
            setMessages([]);
        } catch (err) {
            console.error('Failed to clear history:', err);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 z-50"
                aria-label="Open chat"
            >
                <MessageCircle size={28} />
            </button>
        );
    }

    if (isMinimized) {
        return (
            <button
                onClick={() => setIsMinimized(false)}
                className="fixed bottom-6 right-6 bg-white rounded-full shadow-lg flex items-center gap-2 px-4 py-2 z-50 transition-all"
            >
                <MessageCircle size={20} className="text-green-600" />
                <span className="text-gray-700 font-medium">{CHATBOT_NAME}</span>
                <Minimize2 size={16} className="text-gray-400" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
            {/* Header */}
            <div className="bg-green-600 text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <MessageCircle size={18} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm">{CHATBOT_NAME}</h3>
                        <p className="text-xs text-green-100">Luôn sẵn sàng hỗ trợ bạn</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleClear}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        aria-label="Clear chat"
                        title="Xóa lịch sử"
                    >
                        <Trash2 size={18} />
                    </button>
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        aria-label="Minimize"
                    >
                        <Minimize2 size={18} />
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <MessageCircle size={48} className="mx-auto mb-3 text-gray-300" />
                        <p className="font-medium">Chào bạn! 👋</p>
                        <p className="text-sm mt-1">Tôi có thể giúp gì cho bạn hôm nay?</p>
                        <div className="mt-4 space-y-2">
                            {[
                                'Cây cảnh phù hợp cho người mới bắt đầu?',
                                'Cách chăm sóc cây xương rồng',
                                'Cây nào để trong phòng ngủ?'
                            ].map((suggestion, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setInput(suggestion);
                                        inputRef.current?.focus();
                                    }}
                                    className="block w-full text-left px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                                msg.role === 'user'
                                    ? 'bg-green-600 text-white rounded-br-md'
                                    : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
                            }`}
                        >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white text-gray-800 px-4 py-2.5 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-gray-100">
                <div className="flex items-center gap-2">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent max-h-32"
                        rows={1}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="p-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                    AI có thể sai. Hãy kiểm tra thông tin quan trọng.
                </p>
            </div>
        </div>
    );
}

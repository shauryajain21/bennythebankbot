import React, { useState } from 'react';
import { Send, X, Lightbulb, Info } from 'lucide-react';

const EnhancedChatInterface = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);  // New state for message history
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    setError('');

    // Add user message immediately
    const userMessage = {
      type: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);

    try {
      const res = await fetch('/generate-tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: message }),
      });

      if (!res.ok) {
        throw new Error('Failed to get response');
      }

      const data = await res.json();

      // Add AI response to messages
      const aiMessage = {
        type: 'ai',
        content: data.tweetStorm,
        timestamp: new Date().toISOString()
      };
      setMessages(prevMessages => [...prevMessages, aiMessage]);
      setMessage('');
    } catch (error) {
      console.error('Error:', error);
      setError('Sorry, there was an error processing your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 flex items-center justify-center">
      <div className="w-full max-w-md bg-gray-900 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 flex justify-between items-center">
          <X className="w-6 h-6 text-gray-400" />
          <Lightbulb className="w-6 h-6 text-blue-400" />
          <Info className="w-6 h-6 text-gray-400" />
        </div>

        {/* Message Display */}
        <div className="p-4 space-y-4 min-h-[400px] max-h-[600px] overflow-y-auto">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                msg.type === 'user' 
                  ? 'bg-gray-800 text-white ml-auto max-w-[80%]' 
                  : 'bg-blue-600 text-white max-w-[80%]'
              }`}
            >
              {msg.content}
              <div className="text-xs text-gray-400 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
          {error && (
            <div className="p-3 bg-red-500/10 text-red-400 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-800 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading || !message.trim()}
              className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                'Processing...'
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>

        {/* Feedback Button */}
        <div className="p-4 text-center">
          <button className="text-gray-400 text-sm hover:text-gray-300">
            Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedChatInterface;
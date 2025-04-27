import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, MessagesSquare, X, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Message {
  role: 'user' | 'assistant';
  parts: { text: string }[];
}

export function InvestorAssistant() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      parts: [{ text: `Hi there! I'm GreenAdvisor, your sustainable investing assistant. How can I help you with ESG investing today?` }]
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || isLoading) return;

    // Add user message to the chat
    const userMessage = {
      role: 'user' as const,
      parts: [{ text: message }]
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      // Send the message to the API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          userName: user?.username || 'Investor',
          previousMessages: messages
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      // Add assistant response to the chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        parts: [{ text: data.response }]
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      setMessages(prev => [...prev, {
        role: 'assistant',
        parts: [{ text: "I'm sorry, I'm having trouble connecting right now. Please try again later." }]
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([
      {
        role: 'assistant',
        parts: [{ text: `Hi there! I'm GreenAdvisor, your sustainable investing assistant. How can I help you with ESG investing today?` }]
      }
    ]);
  };

  // Function to toggle the expanded view
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Set the height based on expanded state
  const chatHeight = isExpanded ? 'h-[80vh]' : 'h-[400px]';

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <Button 
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <MessagesSquare className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Interface */}
      <Collapsible open={isOpen}>
        <CollapsibleContent className="animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-5">
          <Card className={cn("w-[350px] sm:w-[400px]", chatHeight, "transition-all duration-300 ease-in-out")}>
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 border-b">
              <div className="flex items-center">
                <MessagesSquare className="h-5 w-5 text-primary mr-2" />
                <CardTitle className="text-base">GreenWealth Investor Assistant</CardTitle>
                <Badge variant="outline" className="ml-2 text-xs font-normal">AI</Badge>
              </div>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" 
                  onClick={toggleExpand}
                >
                  {isExpanded ? 
                    <Minimize2 className="h-4 w-4 text-gray-600 dark:text-gray-400" /> : 
                    <Maximize2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  }
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 transition-colors" 
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <ScrollArea className={cn("flex-1 p-4", isExpanded ? "h-[calc(80vh-120px)]" : "h-[280px]")}>
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "flex",
                      msg.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div 
                      className={cn(
                        "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                        msg.role === 'user' 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      )}
                    >
                      {msg.parts[0].text.split('\n').map((line, i) => (
                        <React.Fragment key={i}>
                          {line}
                          {i < msg.parts[0].text.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted max-w-[80%] rounded-lg px-3 py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <CardContent className="p-4 pt-2 border-t">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  ref={inputRef}
                  placeholder="Ask about ESG investing..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  size="icon"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
                  disabled={!message.trim() || isLoading}
                >
                  {isLoading ? 
                    <Loader2 className="h-4 w-4 animate-spin" /> : 
                    <Send className="h-4 w-4" />
                  }
                </Button>
              </form>
              <div className="flex justify-center mt-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs h-7 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={resetChat}
                >
                  Reset conversation
                </Button>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
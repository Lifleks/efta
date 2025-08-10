import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender_profile: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface ChatWindowProps {
  friendId: string;
  friendName: string;
  onBack: () => void;
}

export default function ChatWindow({ friendId, friendName, onBack }: ChatWindowProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && friendId) {
      initializeChat();
    }
  }, [user, friendId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (chatId) {
      // Subscribe to new messages
      const channel = supabase
        .channel('chat-messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `chat_id=eq.${chatId}`
          },
          (payload) => {
            loadMessages();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [chatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeChat = async () => {
    try {
      // Check if chat already exists between these users
      const { data: existingChat } = await supabase
        .from('chats')
        .select(`
          id,
          chat_participants!inner(user_id)
        `)
        .eq('type', 'direct')
        .eq('chat_participants.user_id', user?.id);

      let currentChatId = null;

      if (existingChat) {
        // Find chat that includes both users
        for (const chat of existingChat) {
          const { data: participants } = await supabase
            .from('chat_participants')
            .select('user_id')
            .eq('chat_id', chat.id);

          if (participants) {
            const userIds = participants.map(p => p.user_id);
            if (userIds.includes(user?.id!) && userIds.includes(friendId)) {
              currentChatId = chat.id;
              break;
            }
          }
        }
      }

      // Create new chat if none exists
      if (!currentChatId) {
        const { data: newChat, error: chatError } = await supabase
          .from('chats')
          .insert({
            type: 'direct',
            name: null
          })
          .select()
          .single();

        if (chatError) throw chatError;

        currentChatId = newChat.id;

        // Add participants
        const { error: participantsError } = await supabase
          .from('chat_participants')
          .insert([
            { chat_id: currentChatId, user_id: user?.id! },
            { chat_id: currentChatId, user_id: friendId }
          ]);

        if (participantsError) throw participantsError;
      }

      setChatId(currentChatId);
      await loadMessages(currentChatId);
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить чат",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatIdToLoad?: string) => {
    const currentChatId = chatIdToLoad || chatId;
    if (!currentChatId) return;

    try {
      const { data: messagesData } = await supabase
        .from('messages')
        .select('id, content, sender_id, created_at')
        .eq('chat_id', currentChatId)
        .order('created_at', { ascending: true });

      if (messagesData) {
        // Get profile data for each message sender
        const messagesWithProfiles = await Promise.all(
          messagesData.map(async (message) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('display_name, avatar_url')
              .eq('user_id', message.sender_id)
              .single();
              
            return {
              ...message,
              sender_profile: profileData || { display_name: null, avatar_url: null }
            };
          })
        );
        setMessages(messagesWithProfiles);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: user?.id!,
          content: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;

      setNewMessage("");
      // Messages will be updated via real-time subscription
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка чата...</div>;
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span>Чат с {friendName}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Начните разговор с {friendName}
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.sender_id !== user?.id && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={message.sender_profile.avatar_url || ''} />
                      <AvatarFallback>
                        {message.sender_profile.display_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.sender_id === user?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.created_at).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  {message.sender_id === user?.id && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.user_metadata?.avatar_url || ''} />
                      <AvatarFallback>
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Введите сообщение..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={!newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
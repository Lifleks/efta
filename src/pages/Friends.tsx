import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, MessageCircle } from "lucide-react";
import FriendsList from "@/components/FriendsList";
import ChatWindow from "@/components/ChatWindow";

export default function Friends() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'friends' | 'chat'>('friends');
  const [selectedFriend, setSelectedFriend] = useState<{
    id: string;
    name: string;
  } | null>(null);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">Загрузка...</div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleStartChat = (friendId: string, friendName: string) => {
    setSelectedFriend({ id: friendId, name: friendName });
    setActiveView('chat');
  };

  const handleBackToFriends = () => {
    setActiveView('friends');
    setSelectedFriend(null);
  };

  return (
    <div className="min-h-screen bg-background font-gothic">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
              <div className="flex items-center gap-2">
                {activeView === 'friends' ? (
                  <>
                    <Users className="w-5 h-5 text-primary" />
                    <h1 className="text-xl font-bold">Друзья</h1>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-5 h-5 text-primary" />
                    <h1 className="text-xl font-bold">Чаты</h1>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {activeView === 'friends' ? (
          <FriendsList onStartChat={handleStartChat} />
        ) : (
          selectedFriend && (
            <ChatWindow
              friendId={selectedFriend.id}
              friendName={selectedFriend.name}
              onBack={handleBackToFriends}
            />
          )
        )}
      </div>
    </div>
  );
}
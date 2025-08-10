import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserPlus, MessageCircle, UserMinus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Friend {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  profiles: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface SearchUser {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  tag: string | null;
}

interface FriendsListProps {
  onStartChat: (friendId: string, friendName: string) => void;
}

export default function FriendsList({ onStartChat }: FriendsListProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (user) {
      loadFriends();
    }
  }, [user]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery.trim().length >= 1) {
        searchUsers();
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  const loadFriends = async () => {
    try {
      // Load accepted friends
      const { data: friendsData } = await supabase
        .from('friendships')
        .select('*')
        .or(`requester_id.eq.${user?.id},addressee_id.eq.${user?.id}`)
        .eq('status', 'accepted');

      if (friendsData) {
        // Get profile data for each friend
        const formattedFriends = await Promise.all(
          friendsData.map(async (friendship) => {
            const friendId = friendship.requester_id === user?.id 
              ? friendship.addressee_id 
              : friendship.requester_id;
              
            const { data: profileData } = await supabase
              .from('profiles')
              .select('id, display_name, avatar_url')
              .eq('user_id', friendId)
              .single();
              
            return {
              ...friendship,
              status: friendship.status as 'pending' | 'accepted' | 'rejected',
              profiles: profileData || { id: friendId, display_name: null, avatar_url: null }
            };
          })
        );
        setFriends(formattedFriends);
      }

      // Load pending requests
      const { data: pendingData } = await supabase
        .from('friendships')
        .select('*')
        .eq('addressee_id', user?.id)
        .eq('status', 'pending');

      if (pendingData) {
        // Get profile data for each pending request
        const formattedPending = await Promise.all(
          pendingData.map(async (request) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('id, display_name, avatar_url')
              .eq('user_id', request.requester_id)
              .single();
              
            return {
              ...request,
              status: request.status as 'pending' | 'accepted' | 'rejected',
              profiles: profileData || { id: request.requester_id, display_name: null, avatar_url: null }
            };
          })
        );
        setPendingRequests(formattedPending);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim() || searchQuery.length < 1) return;

    setSearching(true);
    try {
      const searchTerm = searchQuery.trim().toLowerCase();
      const { data: users } = await supabase
        .from('profiles')
        .select('id, user_id, display_name, avatar_url, tag')
        .or(`tag.eq.${searchTerm},display_name.ilike.%${searchTerm}%`)
        .neq('user_id', user?.id) // Exclude current user
        .limit(10);

      if (users && users.length > 0) {
        // Filter out users who are already friends or have pending requests
        const userIds = users.map(u => u.user_id);
        
        // Check for existing friendships in both directions
        const { data: existingConnections1 } = await supabase
          .from('friendships')
          .select('requester_id, addressee_id')
          .eq('requester_id', user?.id)
          .in('addressee_id', userIds);
          
        const { data: existingConnections2 } = await supabase
          .from('friendships')
          .select('requester_id, addressee_id')
          .eq('addressee_id', user?.id)
          .in('requester_id', userIds);

        const connectedUserIds = new Set();
        existingConnections1?.forEach(conn => {
          connectedUserIds.add(conn.addressee_id);
        });
        existingConnections2?.forEach(conn => {
          connectedUserIds.add(conn.requester_id);
        });

        const filteredUsers = users.filter(u => !connectedUserIds.has(u.user_id));
        setSearchResults(filteredUsers);
        setShowDropdown(filteredUsers.length > 0);
      } else {
        setSearchResults([]);
        setShowDropdown(searchQuery.length >= 1);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setSearching(false);
    }
  };

  const sendFriendRequest = async (targetUser: SearchUser) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .insert({
          requester_id: user?.id,
          addressee_id: targetUser.user_id,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Заявка отправлена",
        description: `Заявка в друзья отправлена пользователю ${targetUser.display_name}`,
      });
      
      setSearchQuery("");
      setSearchResults([]);
      setShowDropdown(false);
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить заявку в друзья",
        variant: "destructive"
      });
    }
  };

  const respondToRequest = async (requestId: string, response: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: response })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: response === 'accepted' ? "Заявка принята" : "Заявка отклонена",
        description: `Заявка в друзья ${response === 'accepted' ? 'принята' : 'отклонена'}`,
      });

      loadFriends();
    } catch (error) {
      console.error('Error responding to request:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось ответить на заявку",
        variant: "destructive"
      });
    }
  };

  const removeFriend = async (friendshipId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);

      if (error) throw error;

      toast({
        title: "Друг удален",
        description: "Пользователь удален из списка друзей",
      });

      loadFriends();
    } catch (error) {
      console.error('Error removing friend:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить друга",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add Friend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Добавить друга
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  placeholder="Поиск по тегу или имени..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  className="flex-1"
                />
                {searching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Dropdown with search results */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-primary/20 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                {searchResults.map((searchUser) => (
                  <div
                    key={searchUser.id}
                    className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer border-b border-primary/10 last:border-b-0"
                    onClick={() => sendFriendRequest(searchUser)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={searchUser.avatar_url || ''} />
                        <AvatarFallback>
                          {searchUser.display_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {searchUser.display_name || 'Пользователь'}
                        </p>
                        {searchUser.tag && (
                          <p className="text-xs text-primary">@{searchUser.tag}</p>
                        )}
                      </div>
                    </div>
                    <UserPlus className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            )}
            
            {showDropdown && searchResults.length === 0 && searchQuery.length >= 1 && !searching && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-primary/20 rounded-lg shadow-lg z-50 p-3">
                <p className="text-sm text-muted-foreground text-center">
                  {searchQuery.startsWith('@') || searchQuery.includes('@') 
                    ? `Пользователь с тегом "${searchQuery}" не найден`
                    : `Пользователи с именем "${searchQuery}" не найдены`
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Входящие заявки ({pendingRequests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={request.profiles.avatar_url || ''} />
                      <AvatarFallback>
                        {request.profiles.display_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {request.profiles.display_name || 'Пользователь'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Хочет добавить вас в друзья
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => respondToRequest(request.id, 'accepted')}
                    >
                      Принять
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => respondToRequest(request.id, 'rejected')}
                    >
                      Отклонить
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Friends List */}
      <Card>
        <CardHeader>
          <CardTitle>Друзья ({friends.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {friends.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              У вас пока нет друзей. Добавьте первого друга!
            </p>
          ) : (
            <div className="space-y-3">
              {friends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={friend.profiles.avatar_url || ''} />
                      <AvatarFallback>
                        {friend.profiles.display_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {friend.profiles.display_name || 'Пользователь'}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        В сети
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => onStartChat(
                        friend.profiles.id, 
                        friend.profiles.display_name || 'Пользователь'
                      )}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => removeFriend(friend.id)}
                    >
                      <UserMinus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
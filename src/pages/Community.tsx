import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, MessageSquare, Music, Heart, Star, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function Community() {
  const navigate = useNavigate();

  const communityFeatures = [
    {
      icon: Users,
      title: "Музыкальное сообщество",
      description: "Присоединяйтесь к сообществу любителей темной музыки со всего мира"
    },
    {
      icon: MessageSquare,
      title: "Обсуждения",
      description: "Делитесь мнениями о музыке, обсуждайте новые релизы и открытия"
    },
    {
      icon: Music,
      title: "Обмен плейлистами",
      description: "Делитесь своими плейлистами и находите новую музыку от других пользователей"
    },
    {
      icon: Heart,
      title: "Избранные треки",
      description: "Отмечайте любимые композиции и собирайте коллекцию лучшего"
    }
  ];

  const topUsers = [
    { name: "DarkMelody", tracks: 1247, followers: 523 },
    { name: "GothicSoul", tracks: 892, followers: 401 },
    { name: "ShadowVibes", tracks: 756, followers: 387 },
    { name: "NightWhisper", tracks: 654, followers: 298 },
    { name: "EternalEcho", tracks: 543, followers: 267 }
  ];

  const popularGenres = [
    { name: "Dark Ambient", count: 15623 },
    { name: "Gothic Rock", count: 12456 },
    { name: "Darkwave", count: 9887 },
    { name: "Industrial", count: 8765 },
    { name: "Dark Folk", count: 7543 },
    { name: "Black Metal", count: 6234 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад на главную
          </Button>
          <h1 className="text-4xl font-bold font-gothic text-gothic-highlight mb-4">
            Присоединиться к сообществу
          </h1>
          <p className="text-muted-foreground">
            Погрузитесь в мир темной музыки вместе с единомышленниками
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Основной контент */}
          <div className="lg:col-span-2 space-y-8">
            {/* Описание сообщества */}
            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardHeader>
                <CardTitle className="text-gothic-highlight flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  О нашем сообществе
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  EFTANASYA объединяет любителей темной, готической и экспериментальной 
                  музыки со всего мира. Наше сообщество - это место, где вы можете:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Открывать новую музыку через рекомендации других участников</li>
                  <li>Делиться своими музыкальными открытиями и плейлистами</li>
                  <li>Участвовать в дискуссиях о музыке и культуре</li>
                  <li>Находить единомышленников с похожими вкусами</li>
                  <li>Следить за активностью интересных пользователей</li>
                </ul>
              </CardContent>
            </Card>

            {/* Возможности сообщества */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {communityFeatures.map((feature, index) => (
                <Card key={index} className="bg-card/50 backdrop-blur border-primary/20 hover:border-primary/40 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gothic-highlight mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Как присоединиться */}
            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardHeader>
                <CardTitle className="text-gothic-highlight">Как присоединиться</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-primary/5">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">1</span>
                    </div>
                    <h4 className="font-medium mb-2">Зарегистрируйтесь</h4>
                    <p className="text-sm text-muted-foreground">
                      Создайте аккаунт и настройте свой профиль
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-primary/5">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">2</span>
                    </div>
                    <h4 className="font-medium mb-2">Добавьте музыку</h4>
                    <p className="text-sm text-muted-foreground">
                      Создайте плейлисты и добавьте любимые треки
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-primary/5">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xl font-bold text-primary">3</span>
                    </div>
                    <h4 className="font-medium mb-2">Взаимодействуйте</h4>
                    <p className="text-sm text-muted-foreground">
                      Общайтесь с другими участниками сообщества
                    </p>
                  </div>
                </div>
                <div className="text-center pt-4">
                  <Button 
                    onClick={() => navigate('/auth')}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Присоединиться сейчас
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Топ пользователей */}
            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardHeader>
                <CardTitle className="text-gothic-highlight flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Активные участники
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topUsers.map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded hover:bg-background/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Headphones className="w-3 h-3" />
                            {user.tracks}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {user.followers}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Популярные жанры */}
            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardHeader>
                <CardTitle className="text-gothic-highlight flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Популярные жанры
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {popularGenres.map((genre, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{genre.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {genre.count.toLocaleString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Статистика сообщества */}
            <Card className="bg-card/50 backdrop-blur border-primary/20">
              <CardHeader>
                <CardTitle className="text-gothic-highlight">Статистика</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">12,847</div>
                    <div className="text-sm text-muted-foreground">Участников</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">89,234</div>
                    <div className="text-sm text-muted-foreground">Треков</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">23,456</div>
                    <div className="text-sm text-muted-foreground">Плейлистов</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
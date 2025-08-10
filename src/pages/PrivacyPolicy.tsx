import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 py-12">
      <div className="max-w-4xl mx-auto px-6">
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
            Политика конфиденциальности
          </h1>
          <p className="text-muted-foreground">
            Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
          </p>
        </div>

        <div className="space-y-8">
          <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardHeader>
              <CardTitle className="text-gothic-highlight">1. Введение</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                EFTANASYA уважает вашу конфиденциальность и стремится защитить ваши 
                персональные данные. Эта политика конфиденциальности объясняет, как мы 
                собираем, используем и защищаем вашу информацию при использовании нашего 
                музыкального сервиса.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardHeader>
              <CardTitle className="text-gothic-highlight">2. Собираемая информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-semibold">Мы собираем следующие типы информации:</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Информация об аккаунте (email, имя пользователя)</li>
                <li>История прослушивания музыки</li>
                <li>Музыкальные предпочтения и плейлисты</li>
                <li>Техническая информация (IP-адрес, тип браузера)</li>
                <li>Данные об использовании сервиса</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardHeader>
              <CardTitle className="text-gothic-highlight">3. Использование информации</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-semibold">Мы используем собранную информацию для:</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Предоставления и улучшения наших сервисов</li>
                <li>Персонализации музыкальных рекомендаций</li>
                <li>Обеспечения безопасности аккаунта</li>
                <li>Связи с пользователями по важным вопросам</li>
                <li>Анализа и улучшения производительности платформы</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardHeader>
              <CardTitle className="text-gothic-highlight">4. Защита данных</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Мы применяем современные технические и организационные меры для защиты 
                ваших персональных данных от несанкционированного доступа, изменения, 
                раскрытия или уничтожения.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Шифрование данных при передаче и хранении</li>
                <li>Регулярные проверки безопасности</li>
                <li>Ограниченный доступ к персональным данным</li>
                <li>Соблюдение международных стандартов безопасности</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardHeader>
              <CardTitle className="text-gothic-highlight">5. Ваши права</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <h4 className="font-semibold">У вас есть следующие права:</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Доступ к своим персональным данным</li>
                <li>Исправление неточных данных</li>
                <li>Удаление ваших данных</li>
                <li>Ограничение обработки данных</li>
                <li>Переносимость данных</li>
                <li>Возражение против обработки</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-primary/20">
            <CardHeader>
              <CardTitle className="text-gothic-highlight">6. Контакты</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Если у вас есть вопросы о нашей политике конфиденциальности или 
                вы хотите воспользоваться своими правами, пожалуйста, свяжитесь с нами:
              </p>
              <div className="space-y-2">
                <p><strong>Email:</strong> privacy@eftanasya.com</p>
                <p><strong>Адрес:</strong> Россия, Москва</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
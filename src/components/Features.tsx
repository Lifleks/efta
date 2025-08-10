import { Music, Image, Headphones, Zap, Users, Palette } from "lucide-react";
import { Card } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      icon: <Music className="w-8 h-8" />,
      title: "Бесконечный плейлист",
      description: "Многоуровневая система треков, адаптирующаяся под твое настроение и внутреннее состояние"
    },
    {
      icon: <Image className="w-8 h-8" />,
      title: "Визуальная галерея",
      description: "Темные арт-работы и готическая эстетика, синхронизированная с музыкальными композициями"
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: "Иммерсивный звук",
      description: "Пространственное аудио и биауральные ритмы для глубокого погружения в музыкальные миры"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Нейро-интерфейс",
      description: "ИИ-анализ эмоционального состояния для персонализированных музыкальных рекомендаций"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Темное сообщество",
      description: "Сеть единомышленников: художники, маркетологи, криптоэнтузиасты и визионеры"
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Креативные инструменты",
      description: "Интегрированные средства для создания собственных композиций и визуального контента"
    }
  ];

  return (
    <section className="py-20 px-6 bg-gradient-highlight">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gothic-highlight mb-6">
            Погружение в бездну возможностей
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Каждая функция создана для того, чтобы расширить границы восприятия и подключить тебя к первозданной энергии творчества
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="p-8 bg-card border-gothic-accent hover:shadow-glow transition-all duration-500 hover:scale-105 group"
            >
              <div className="text-gothic-glow mb-4 group-hover:animate-gothic-glow">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gothic-highlight mb-4">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
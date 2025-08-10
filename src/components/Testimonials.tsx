import { Card } from "@/components/ui/card";
import { Star } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Void.Shadow",
      role: "Digital Artist",
      content: "Eftanasya изменила мое восприятие музыки. Каждый трек здесь — это портал в новое измерение творчества. Теперь я создаю арт под эти ритмы.",
      rating: 5
    },
    {
      name: "CryptoNomad",
      role: "Blockchain Entrepreneur",
      content: "Никогда не думал, что музыкальный плеер может влиять на продуктивность в работе. Eftanasya синхронизирует мой внутренний ритм с рыночными циклами.",
      rating: 5
    },
    {
      name: "Luna.Mortis",
      role: "Gothic Photographer",
      content: "Это не просто плеер — это философия. Каждая композиция рассказывает историю, а визуальная составляющая дополняет эмоциональный спектр.",
      rating: 5
    },
    {
      name: "TechShaman",
      role: "Startup Founder",
      content: "Eftanasya помогает мне находить вдохновение в самые темные моменты разработки. Музыка здесь — это код для души.",
      rating: 5
    },
    {
      name: "NightCrawler",
      role: "Trend Analyst",
      content: "Отслеживаю культурные тренды через призму музыки. Eftanasya всегда на шаг впереди — здесь рождаются завтрашние хиты.",
      rating: 5
    },
    {
      name: "Ethereal.Mind",
      role: "Sound Designer",
      content: "Биауральные композиции в Eftanasya открыли новые горизонты в создании саундтреков. Это революция в аудио-искусстве.",
      rating: 5
    }
  ];

  return (
    <section className="py-20 px-6 bg-gradient-gothic">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gothic-highlight mb-6">
            Голоса из бездны
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Те, кто уже прошел через трансформацию, делятся своим опытом погружения в Eftanasya
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="p-6 bg-card border-gothic-accent hover:shadow-glow transition-all duration-500 hover:scale-105"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gothic-glow text-gothic-glow" />
                ))}
              </div>
              
              <blockquote className="text-muted-foreground mb-6 leading-relaxed italic">
                "{testimonial.content}"
              </blockquote>
              
              <div className="border-t border-gothic-accent pt-4">
                <div className="font-semibold text-gothic-highlight">
                  {testimonial.name}
                </div>
                <div className="text-sm text-gothic-accent">
                  {testimonial.role}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
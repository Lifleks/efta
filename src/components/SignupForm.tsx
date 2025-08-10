import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    purpose: ""
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.purpose) {
      toast({
        title: "Заполните все поля",
        description: "Для входа в бездну требуется полная информация",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Добро пожаловать в бездну",
      description: "Твоя регистрация принята. Скоро ты получишь доступ к запретным знаниям."
    });
    
    setFormData({ name: "", email: "", purpose: "" });
  };

  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gothic-highlight mb-6">
            Войди в круг избранных
          </h2>
          <p className="text-xl text-muted-foreground">
            Только те, кто готов к трансформации, получат доступ к полной версии Eftanasya
          </p>
        </div>

        <Card className="p-8 bg-gradient-highlight border-gothic-accent shadow-gothic">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gothic-highlight">
                Имя / Псевдоним
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Как тебя зовут в этой реальности?"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-input border-gothic-accent focus:border-gothic-glow"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gothic-highlight">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="portal@darkness.void"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-input border-gothic-accent focus:border-gothic-glow"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose" className="text-gothic-highlight">
                Цель регистрации
              </Label>
              <Select onValueChange={(value) => setFormData({ ...formData, purpose: value })}>
                <SelectTrigger className="bg-input border-gothic-accent focus:border-gothic-glow">
                  <SelectValue placeholder="Выбери свой путь в бездне" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-gothic-accent">
                  <SelectItem value="artist">Художник / Творец</SelectItem>
                  <SelectItem value="marketer">Маркетолог / Стратег</SelectItem>
                  <SelectItem value="crypto">Криптоэнтузиаст</SelectItem>
                  <SelectItem value="startup">Стартапер / Предприниматель</SelectItem>
                  <SelectItem value="trends">Трендвотчер</SelectItem>
                  <SelectItem value="music">Меломан / Музыкант</SelectItem>
                  <SelectItem value="other">Другое измерение</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" variant="hero" size="lg" className="w-full text-lg py-4">
              Погрузиться в бездну
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
};

export default SignupForm;
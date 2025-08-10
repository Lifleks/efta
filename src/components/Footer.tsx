import { Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-gothic border-t border-gothic-accent">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-gothic-highlight">
              EFTANASYA
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Портал в измерения звука, где технология встречается с искусством, 
              а сознание расширяется до бесконечности.
            </p>
            <div className="w-24 h-1 bg-gradient-glow" />
          </div>

          {/* Links */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-gothic-highlight">
              Навигация по бездне
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="/privacy" className="text-muted-foreground hover:text-gothic-glow transition-colors">
                  Политика конфиденциальности
                </a>
              </li>
              <li>
                <a href="/terms" className="text-muted-foreground hover:text-gothic-glow transition-colors">
                  Пользовательское соглашение
                </a>
              </li>
              <li>
                <a href="/usage" className="text-muted-foreground hover:text-gothic-glow transition-colors">
                  Условия использования
                </a>
              </li>
              <li>
                <a href="/support" className="text-muted-foreground hover:text-gothic-glow transition-colors">
                  Техническая поддержка
                </a>
              </li>
              <li>
                <a href="/community" className="text-muted-foreground hover:text-gothic-glow transition-colors">
                  Присоединиться к сообществу
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-gothic-highlight">
              Связь с создателями
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="w-5 h-5 text-gothic-glow" />
                <span>contact@eftanasya.void</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-5 h-5 text-gothic-glow" />
                <span>+7 (000) 000-00-00</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="w-5 h-5 text-gothic-glow" />
                <span>Цифровое измерение</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gothic-accent mt-12 pt-8 text-center">
          <p className="text-muted-foreground">
            © 2024 Eftanasya. Все права защищены законами цифровой вселенной.
          </p>
          <p className="text-sm text-gothic-accent mt-2">
            "В звуке мы находим истину, в тишине — бесконечность"
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
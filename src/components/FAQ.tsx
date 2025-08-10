import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "Что такое Eftanasya и чем она отличается от обычных плееров?",
      answer: "Eftanasya — это не просто музыкальный плеер, а комплексная платформа для трансцендентного опыта. Мы объединяем музыку, визуальное искусство и нейротехнологии для создания уникального иммерсивного путешествия."
    },
    {
      question: "Какую музыку я найду в Eftanasya?",
      answer: "Наша коллекция включает dark ambient, industrial, gothic, post-punk, darkwave, и эксперименальную электронику. Мы фокусируемся на композициях, которые расширяют сознание и провоцируют глубокие эмоциональные переживания."
    },
    {
      question: "Как работает система персонализации?",
      answer: "ИИ-алгоритм анализирует твои эмоциональные паттерны, время прослушивания и взаимодействие с визуальным контентом. На основе этих данных создается уникальный музыкальный профиль, который постоянно эволюционирует."
    },
    {
      question: "Можно ли использовать Eftanasya для творческой работы?",
      answer: "Абсолютно. Многие художники, дизайнеры и креативные предприниматели используют Eftanasya как источник вдохновения. Интегрированные инструменты позволяют создавать собственные плейлисты и визуальные композиции."
    },
    {
      question: "Есть ли ограничения по географии?",
      answer: "Eftanasya доступна по всему миру. Мы верим, что темная энергия творчества не знает границ и должна быть доступна всем искателям истины."
    },
    {
      question: "Как часто обновляется контент?",
      answer: "Новые композиции и визуальные работы добавляются еженедельно. Мы сотрудничаем с underground-художниками со всего мира, чтобы постоянно расширять границы аудиовизуального опыта."
    },
    {
      question: "Есть ли сообщество пользователей?",
      answer: "Да, у нас есть закрытое сообщество единомышленников — The Void Collective. Здесь артисты, маркетологи, криптоэнтузиасты и визионеры обмениваются идеями и совместно создают будущее цифрового искусства."
    }
  ];

  return (
    <section className="py-20 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gothic-highlight mb-6">
            Вопросы из глубин
          </h2>
          <p className="text-xl text-muted-foreground">
            Ответы на самые важные вопросы о путешествии в Eftanasya
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="border border-gothic-accent rounded-lg px-6 data-[state=open]:shadow-glow"
            >
              <AccordionTrigger className="text-left text-gothic-highlight hover:text-gothic-glow transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
const Philosophy = () => {
  return (
    <section className="py-20 px-6 bg-gradient-gothic">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gothic-highlight mb-12">
          Кто есть люди
        </h2>
        
        <div className="relative">
          {/* Gothic decorative elements */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-glow" />
          
          <blockquote className="text-2xl md:text-3xl italic text-gothic-glow leading-relaxed mb-8">
            "Человек есть нечто, что должно превзойти самого себя. Что ты сделал, чтобы превзойти себя?"
          </blockquote>
          
          <cite className="text-lg text-muted-foreground">
            — Фридрих Ницше
          </cite>
          
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-glow" />
        </div>
        
        <div className="mt-16 space-y-6 text-lg text-muted-foreground leading-relaxed">
          <p>
            Мы — те, кто не довольствуется поверхностными ритмами массовой культуры. 
            Мы ищем глубину в звуке, смысл в тишине, красоту в темноте.
          </p>
          <p>
            Художники и визионеры, маркетологи и технологи, все мы объединены одним — 
            жаждой трансценденции через искусство и музыку.
          </p>
          <p className="text-gothic-accent font-medium">
            Eftanasya — это не просто плеер. Это портал в иные измерения сознания.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Philosophy;
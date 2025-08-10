import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';
import { ArrowLeft } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";

const Auth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Redirect authenticated users to profile
        if (session?.user) {
          navigate('/profile');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        navigate('/profile');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: "Пользователь уже существует",
            description: "Попробуйте войти вместо регистрации",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Ошибка регистрации",
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Регистрация успешна",
          description: "Проверьте email для подтверждения аккаунта"
        });
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла непредвиденная ошибка",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Неверные данные",
            description: "Проверьте email и пароль",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Ошибка входа",
            description: error.message,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Добро пожаловать в бездну",
          description: "Вы успешно вошли в систему"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла непредвиденная ошибка",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast({
        title: "Введите email",
        description: "Для сброса пароля нужно указать email",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`
      });

      if (error) {
        toast({
          title: "Ошибка сброса пароля",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Письмо отправлено",
          description: "Проверьте почту для сброса пароля"
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Произошла непредвиденная ошибка",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-gothic flex items-center justify-center p-6 relative">
      {/* Back to Home Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-30 text-muted-foreground hover:text-gothic-highlight"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        На главную
      </Button>

      {/* Gothic Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gothic-glow/10 rounded-full blur-3xl animate-gothic-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gothic-glow/5 rounded-full blur-3xl animate-float" />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gothic-highlight mb-2">
            ВХОД В БЕЗДНУ
          </h1>
          <div className="w-16 h-1 bg-gradient-glow mx-auto mb-4" />
          <p className="text-muted-foreground">
            Откройся темным ритмам подсознания
          </p>
        </div>

        <Card className="bg-card/80 backdrop-blur-sm border-gothic-accent">
          <CardHeader>
            <CardTitle className="text-gothic-highlight text-center">
              Присоединиться к культу звука
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Войдите или зарегистрируйтесь для доступа к плееру
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Вход</TabsTrigger>
                <TabsTrigger value="signup">Регистрация</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ваш@email.com"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Пароль</Label>
                    <PasswordInput
                      id="signin-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    variant="gothic" 
                    size="lg" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Входим..." : "Войти в бездну"}
                  </Button>
                  <Button 
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground hover:text-gothic-highlight"
                    onClick={handlePasswordReset}
                    disabled={isLoading}
                  >
                    Забыли пароль? Восстановить
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ваш@email.com"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Пароль</Label>
                    <PasswordInput
                      id="signup-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    variant="hero" 
                    size="lg" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Создаем..." : "Присоединиться к культу"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
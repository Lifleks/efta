import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  disabled?: boolean;
  minLength?: number;
}

const PasswordInput = ({ id, value, onChange, placeholder, required, disabled, minLength }: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const togglePasswordVisibility = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setShowPassword(!showPassword);
      setIsAnimating(false);
    }, 250);
  };

  return (
    <div className="relative">
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        minLength={minLength}
        className="pr-12"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
        onClick={togglePasswordVisibility}
      >
        <div className="relative">
          {/* Смайлик */}
          <span 
            className={`text-lg transition-all duration-300 ${
              isAnimating ? (showPassword ? 'brain-return' : 'brain-fall') : ''
            }`}
          >
            {showPassword ? '🤯' : '😊'}
          </span>
          
          {/* Мозги (отображаются когда показан пароль) */}
          {showPassword && (
            <div className="absolute -top-8 -left-2 text-xs opacity-60">
              🧠💨
            </div>
          )}
        </div>
      </Button>
    </div>
  );
};

export default PasswordInput;
import { LucideIcon } from 'lucide-react';

interface PrimaryButtonProps {
  children: React.ReactNode;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'gradient';
  onClick?: () => void;
  className?: string;
}

export function PrimaryButton({ 
  children, 
  icon: Icon, 
  variant = 'primary',
  onClick,
  className = ''
}: PrimaryButtonProps) {
  const baseStyles = "h-14 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all font-semibold";
  
  const variantStyles = {
    primary: "bg-[#4F46E5] text-white hover:bg-[#4338CA] active:scale-[0.98]",
    secondary: "bg-white border-2 border-[#E0E7FF] text-[#4F46E5] hover:bg-[#F5F7FF]",
    gradient: "bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white hover:opacity-90"
  };

  return (
    <button 
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
      {Icon && <Icon className="w-5 h-5" />}
    </button>
  );
}

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'info';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-brand-primary text-black font-black shadow-xl shadow-brand-primary/10 hover:scale-[1.02]',
    secondary: 'bg-white/5 text-white border border-white/10 hover:bg-white/10',
    danger: 'bg-semantic-error/10 text-semantic-error border border-semantic-error/20 hover:bg-semantic-error hover:text-white',
    ghost: 'text-ui-muted hover:text-ui-text hover:bg-white/5',
    info: 'bg-semantic-info text-black font-bold hover:bg-semantic-info/80'
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-2 text-xs rounded-lg',
    md: 'px-4 py-3 text-sm rounded-xl',
    lg: 'px-4 py-4 text-sm rounded-2xl'
};

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className = '',
    children,
    ...props
}) => {
    const widthClass = fullWidth ? 'w-full' : '';

    return (
        <button
            className={`uppercase tracking-tighter transition-all active:scale-95 ${variantStyles[variant]} ${sizeStyles[size]} ${widthClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    children: React.ReactNode;
}

const iconSizeStyles: Record<ButtonSize, string> = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
};

export const IconButton: React.FC<IconButtonProps> = ({
    variant = 'ghost',
    size = 'md',
    className = '',
    children,
    ...props
}) => {
    return (
        <button
            className={`rounded-xl transition-all ${variantStyles[variant]} ${iconSizeStyles[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;

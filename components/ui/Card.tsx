import React from 'react';

type CardVariant = 'glass' | 'primary' | 'dark';
type CardPadding = 'sm' | 'md' | 'lg';
type CardRounded = 'lg' | 'xl' | '2xl' | '3xl';

interface CardProps {
    variant?: CardVariant;
    padding?: CardPadding;
    rounded?: CardRounded;
    className?: string;
    children: React.ReactNode;
    onClick?: () => void;
}

const variantStyles: Record<CardVariant, string> = {
    glass: 'glass-card border border-brand-primary/10 shadow-2xl',
    primary: 'glass-card border border-brand-primary/30 bg-brand-primary/5 shadow-[0_0_30px_rgba(119,194,85,0.05)]',
    dark: 'bg-black border border-white/10 shadow-2xl'
};

const paddingStyles: Record<CardPadding, string> = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
};

const roundedStyles: Record<CardRounded, string> = {
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-[32px]'
};

export const Card: React.FC<CardProps> = ({
    variant = 'glass',
    padding = 'lg',
    rounded = '3xl',
    className = '',
    children,
    onClick
}) => {
    const baseClasses = `${variantStyles[variant]} ${paddingStyles[padding]} ${roundedStyles[rounded]}`;
    const interactiveClasses = onClick ? 'cursor-pointer hover:border-brand-primary/40 transition-all active:scale-95' : '';

    return (
        <div
            className={`${baseClasses} ${interactiveClasses} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default Card;

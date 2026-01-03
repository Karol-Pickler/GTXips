import React from 'react';

type InputVariant = 'default' | 'dark';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    variant?: InputVariant;
}

const variantStyles: Record<InputVariant, string> = {
    default: 'bg-white/5 border-white/10 focus:border-brand-primary text-white placeholder:text-ui-muted/20',
    dark: 'bg-black border-brand-primary/20 focus:border-brand-primary text-white placeholder:text-ui-muted/30'
};

export const Input: React.FC<InputProps> = ({
    label,
    variant = 'default',
    className = '',
    ...props
}) => {
    return (
        <div>
            {label && (
                <label className="text-[10px] text-ui-muted uppercase font-black tracking-widest ml-1 mb-2 block">
                    {label}
                </label>
            )}
            <input
                className={`w-full border rounded-2xl p-4 outline-none font-bold transition-colors ${variantStyles[variant]} ${className}`}
                {...props}
            />
        </div>
    );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    variant?: InputVariant;
}

export const Textarea: React.FC<TextareaProps> = ({
    label,
    variant = 'default',
    className = '',
    ...props
}) => {
    return (
        <div>
            {label && (
                <label className="text-[10px] text-ui-muted uppercase font-black tracking-widest ml-1 mb-2 block">
                    {label}
                </label>
            )}
            <textarea
                className={`w-full border rounded-2xl p-4 outline-none font-medium text-sm transition-colors ${variantStyles[variant]} ${className}`}
                {...props}
            />
        </div>
    );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    variant?: InputVariant;
    children: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
    label,
    variant = 'default',
    className = '',
    children,
    ...props
}) => {
    return (
        <div>
            {label && (
                <label className="text-[10px] text-ui-muted uppercase font-black tracking-widest ml-1 mb-2 block">
                    {label}
                </label>
            )}
            <select
                className={`w-full border rounded-2xl p-4 outline-none appearance-none font-bold cursor-pointer transition-colors ${variantStyles[variant]} ${className}`}
                {...props}
            >
                {children}
            </select>
        </div>
    );
};

export default Input;

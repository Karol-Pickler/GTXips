import React from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, action }) => {
    return (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">{title}</h1>
                {description && (
                    <p className="text-ui-muted mt-1 font-medium">{description}</p>
                )}
            </div>
            {action && (
                <div>{action}</div>
            )}
        </header>
    );
};

export default PageHeader;

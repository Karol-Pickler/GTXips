import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => (
  <img
    src="/logo.png"
    alt="GTXIPS Logo"
    className={className}
  />
);

export default Logo;

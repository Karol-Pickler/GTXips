import React from 'react';

import logo from '../../logo.png';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => (
  <img
    src={logo}
    alt="GTXIPS Logo"
    className={className}
  />
);

export default Logo;

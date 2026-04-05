import React from 'react';

interface LogoProps {
  visible: boolean;
}

const Logo: React.FC<LogoProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <div className="logo-container">
      <h1>DINO-GE</h1>
    </div>
  );
};

export default Logo;

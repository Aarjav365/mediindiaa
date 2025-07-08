import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, title, className = '' }) => {
  return (
    <div className={`card ${className}`}>
      {title && <h3 className="text-lg font-medium mb-4">{title}</h3>}
      {children}
    </div>
  );
};

export default Card;
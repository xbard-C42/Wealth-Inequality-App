import React from 'react';
export function Button({ children, onClick, variant, size }) {
  const base = 'px-3 py-1 border rounded';
  const style = variant === 'secondary' ? 'bg-gray-200' : 'bg-white';
  return (
    <button onClick={onClick} className={`${base} ${style} text-sm`}>{children}</button>
  );
}
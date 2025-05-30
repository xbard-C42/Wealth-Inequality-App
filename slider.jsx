import React from 'react';
export function Slider({ value, min, max, step, onValueChange, className }) {
  const handle = e => onValueChange([Number(e.target.value)]);
  return (
    <input
      type="range"
      value={value[0]}
      min={min} max={max} step={step}
      onChange={handle}
      className={className}
    />
  );
}
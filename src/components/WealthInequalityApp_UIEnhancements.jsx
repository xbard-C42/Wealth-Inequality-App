import React from 'react';
import { Button } from './ui/button';

export function UIControls({ threshold, excess, resetDefaults }) {
  const shareView = () => {
    const msg = `Excess wealth above €${threshold.toLocaleString()} could end homelessness ${Math.round(excess)}× over. See the math: `;
    if (navigator.share) {
      navigator.share({ title: 'Wealth Inequality Math', text: msg, url: window.location.href });
    } else {
      navigator.clipboard.writeText(msg + window.location.href);
    }
  };

  return (
    <div className="flex space-x-2 mt-4">
      <Button onClick={shareView} variant="secondary" size="sm">Share this view</Button>
      <Button onClick={resetDefaults} variant="outline" size="sm">Reset to defaults</Button>
    </div>
  );
}
import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { processWealthData } from './calculations';

// Sample wealth data - replace with real percentile data
const wealthData = [
  { wealth: 0 }, { wealth: 10000 }, { wealth: 25000 }, { wealth: 50000 },
  { wealth: 75000 }, { wealth: 100000 }, { wealth: 150000 }, { wealth: 200000 },
  { wealth: 300000 }, { wealth: 500000 }, { wealth: 750000 }, { wealth: 1000000 },
  { wealth: 1500000 }, { wealth: 2500000 }, { wealth: 5000000 }, { wealth: 10000000 },
  { wealth: 25000000 }, { wealth: 50000000 }, { wealth: 100000000 }, { wealth: 500000000 }
];

export default function WealthInequalityApp() {
  // Read initial settings from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const initialThreshold = Number(urlParams.get('plateau')) || 200000;
  const initialInterventions = urlParams.get('interventions')?.split(',') || ['healthcare', 'homelessness'];

  // State
  const [threshold, setThreshold] = useState(initialThreshold);
  const [showHomelessness, setShowHomelessness] = useState(initialInterventions.includes('homelessness'));
  const [showHealthcare, setShowHealthcare] = useState(initialInterventions.includes('healthcare'));
  const [showPoverty, setShowPoverty] = useState(initialInterventions.includes('poverty'));
  const [showEducation, setShowEducation] = useState(initialInterventions.includes('education'));
  const [showReality, setShowReality] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);

  // Update URL on state change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('plateau', threshold);
    const active = [];
    if (showHealthcare) active.push('healthcare');
    if (showHomelessness) active.push('homelessness');
    if (showPoverty) active.push('poverty');
    if (showEducation) active.push('education');
    if (active.length > 0) params.set('interventions', active.join(','));
    
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [threshold, showHomelessness, showHealthcare, showPoverty, showEducation]);

  // Process data with corrected calculations
  const processedResults = useMemo(() => {
    return processWealthData(wealthData, threshold);
  }, [threshold]);

  const { data, metrics } = processedResults;
  const { excess, gini, palma, thresholdIndex } = metrics;

  // Share functionality
  const shareView = () => {
    const excessRounded = Math.round(excess || 0);
    const message = `Excess wealth above €${threshold.toLocaleString()} could end homelessness ${excessRounded}× over. See the math:`;
    
    if (navigator.share) {
      navigator.share({ 
        title: 'Wealth Inequality Math', 
        text: message, 
        url: window.location.href 
      }).catch(() => {
        fallbackCopy();
      });
    } else {
      fallbackCopy();
    }
    
    function fallbackCopy() {
      navigator.clipboard.writeText(`${message} ${window.location.href}`)
        .then(() => alert('Link copied to clipboard!'))
        .catch(() => alert('Failed to copy link'));
    }
  };

  const resetDefaults = () => {
    setThreshold(200000);
    setShowHealthcare(true);
    setShowHomelessness(true);
    setShowPoverty(false);
    setShowEducation(false);
    setShowReality(false);
    setShowMetrics(false);
  };

  return (
    <div className="p-4 space-y-6 max-w-6xl mx-auto">
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold mb-4">Wealth Inequality & Utility Plateau</h2>
          
          <div className="mb-6">
            <Slider
              value={[threshold]}
              min={0}
              max={data[data.length-1].wealth}
              step={10000}
              onValueChange={([val]) => setThreshold(val)}
              className="mb-2"
            />
            <div className="text-sm text-gray-600">Utility plateau threshold: €{threshold.toLocaleString()}</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={showHomelessness} 
                    onCheckedChange={(checked) => setShowHomelessness(checked)} 
                  />
                  <span>End homelessness (€1T)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={showHealthcare} 
                    onCheckedChange={(checked) => setShowHealthcare(checked)} 
                  />
                  <span>Universal healthcare (€8T)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={showPoverty} 
                    onCheckedChange={(checked) => setShowPoverty(checked)} 
                  />
                  <span>Eradicate poverty (€0.06T)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={showEducation} 
                    onCheckedChange={(checked) => setShowEducation(checked)} 
                  />
                  <span>Education (€0.04T)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={showReality} 
                    onCheckedChange={(checked) => setShowReality(checked)} 
                  />
                  <span>Show Reality Check</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    checked={showMetrics} 
                    onCheckedChange={(checked) => setShowMetrics(checked)} 
                  />
                  <span>Show Inequality Metrics</span>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2 space-y-2">
              <p className="text-lg">
                <span className="text-gray-600">Redistributable excess above €{threshold.toLocaleString()}:</span>
                <br />
                <strong className="text-red-600 text-xl">€{excess.toFixed(2)}T</strong>
              </p>
              
              {showHealthcare && <p>Could fund healthcare <strong className="text-blue-600">{(excess / 8).toFixed(1)}×</strong></p>}
              {showHomelessness && <p>Could end homelessness <strong className="text-green-600">{(excess / 1).toFixed(1)}×</strong></p>}
              {showPoverty && <p>Could eradicate poverty <strong className="text-purple-600">{(excess / 0.06).toFixed(1)}×</strong></p>}
              {showEducation && <p>Could fund education <strong className="text-orange-600">{(excess / 0.04).toFixed(1)}×</strong></p>}
              
              {showMetrics && (
                <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                  <p className="font-medium mb-2">Inequality Metrics:</p>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-medium">Gini Coefficient:</span>
                      <br />
                      <span className="text-lg">{gini.toFixed(3)}</span>
                      <br />
                      <span className="text-gray-600">(0 = perfect equality, 1 = maximum inequality)</span>
                    </div>
                    <div>
                      <span className="font-medium">Palma Ratio:</span>
                      <br />
                      <span className="text-lg">{palma === Infinity ? '∞' : palma.toFixed(2)}</span>
                      <br />
                      <span className="text-gray-600">(Top 10% share ÷ Bottom 40% share)</span>
                    </div>
                  </div>
                </div>
              )}
              
              {showReality && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p className="font-medium mb-2">What €{threshold.toLocaleString()} provides:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Nice house</li>
                    <li>Reliable car</li>
                    <li>Annual holidays</li>
                    <li>Children's education covered</li>
                    <li>Comfortable retirement</li>
                  </ul>
                </div>
              )}
              
              <div className="flex space-x-2 mt-4">
                <Button onClick={shareView} variant="secondary" size="sm">
                  Share this view
                </Button>
                <Button onClick={resetDefaults} variant="outline" size="sm">
                  Reset to defaults
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={500}>
            <LineChart data={data} margin={{ top: 20, right: 50, bottom: 20, left: 20 }}>
              <XAxis 
                dataKey="wealth" 
                tickFormatter={w => w >= 1e6 ? `€${(w/1e6).toFixed(1)}M` : `€${(w/1000).toFixed(0)}k`} 
              />
              <YAxis yAxisId="left" domain={[0,1]} tickFormatter={v => `${(v*100).toFixed(0)}%`} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={v => `€${(v/1e6).toFixed(1)}M`} />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'utility' ? `${(value*100).toFixed(1)}%` : `€${value.toLocaleString()}`,
                  name === 'utility' ? 'Marginal Utility' : 'Wealth Level'
                ]} 
                labelFormatter={w => `Wealth: €${Number(w).toLocaleString()}`}
              />
              <Legend />

              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="utility" 
                stroke="#4f46e5" 
                strokeWidth={3} 
                dot={false} 
                name="Marginal Utility (%)" 
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="wealthPct" 
                stroke="#f59e0b" 
                strokeDasharray="5 5" 
                strokeWidth={2} 
                dot={false} 
                name="Wealth Level (€)" 
              />

              {thresholdIndex >= 0 && (
                <ReferenceLine
                  x={threshold}
                  stroke="#ef4444" 
                  strokeWidth={3}
                  label={{ 
                    value: `Plateau @ €${threshold.toLocaleString()}`, 
                    position: 'topLeft', 
                    fill: '#ef4444',
                    fontSize: 12,
                    fontWeight: 'bold'
                  }}
                />
              )}

              {showHomelessness && thresholdIndex >= 0 && (
                <ReferenceArea 
                  x1={threshold} 
                  x2={data[data.length-1]?.wealth || threshold} 
                  fill="rgba(34,197,94,0.1)" 
                  yAxisId="left"
                  label={{ value: "Homelessness Fund Area", position: "center" }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
          
          <div className="mt-4 text-xs text-gray-600">
            <strong>Mathematical Note:</strong> Excess calculation now correctly computes only redistributable surplus 
            (individual wealth minus threshold) rather than mixing total wealth concepts. 
            Utility scaling dynamically adjusts to selected plateau threshold.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
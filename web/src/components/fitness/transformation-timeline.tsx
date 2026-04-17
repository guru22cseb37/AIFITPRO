"use client";

import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from "recharts";
import { Card, CardHeader } from "@/components/ui/card";

export function TransformationTimeline({ currentWeight, goalWeight, goalType }: { currentWeight: number, goalWeight?: number, goalType: string }) {
  // Generate projection data based on goal
  const data = useMemo(() => {
    const isLoss = goalType.includes("lose") || goalType.includes("cut");
    const isGain = goalType.includes("gain") || goalType.includes("bulk");
    
    // Default projection if no goal weight
    const target = goalWeight ?? (isLoss ? currentWeight * 0.9 : isGain ? currentWeight * 1.1 : currentWeight);
    
    const diff = target - currentWeight;
    const weeklyChange = isLoss ? -0.5 : isGain ? 0.25 : 0; // standard healthy rate (kg/week)
    
    // Calculate weeks needed (cap at 12 for chart)
    const weeksNeeded = weeklyChange === 0 ? 12 : Math.min(Math.abs(diff / weeklyChange), 12);
    
    const points = [];
    for (let i = 0; i <= 12; i++) {
      if (i === 0) {
        points.push({ week: "Now", weight: currentWeight, isProjected: false });
      } else {
        // Project forward
        let projWeight = currentWeight + (weeklyChange * i);
        // Don't overshoot target in projection
        if ((isLoss && projWeight < target) || (isGain && projWeight > target)) {
            projWeight = target;
        }
        points.push({ week: `W${i}`, weight: Number(projWeight.toFixed(1)), isProjected: true });
      }
    }
    return points;
  }, [currentWeight, goalWeight, goalType]);

  const target = data[data.length - 1].weight;
  const isLoss = goalType.includes("lose") || goalType.includes("cut");
  const yDomain = isLoss 
    ? [Math.floor(target - 2), Math.ceil(currentWeight + 1)]
    : [Math.floor(currentWeight - 1), Math.ceil(target + 2)];

  return (
    <Card>
      <CardHeader 
        title="Transformation Timeline" 
        subtitle="AI projection based on current trajectory" 
      />
      <div className="mt-2 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="week" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} domain={yDomain} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#18181b', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
              itemStyle={{ color: 'var(--accent)', fontWeight: 'bold' }}
              labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
            />
            {goalWeight && (
              <ReferenceLine y={goalWeight} stroke="var(--muted)" strokeDasharray="3 3" label={{ position: 'top', value: 'Goal', fill: 'var(--muted)', fontSize: 12 }} />
            )}
            <Area 
              type="monotone" 
              dataKey="weight" 
              stroke="var(--accent)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorWeight)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

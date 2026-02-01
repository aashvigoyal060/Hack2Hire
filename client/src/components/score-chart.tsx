import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from 'recharts';
import { Card } from "@/components/ui/card";

interface ScoreChartProps {
  scores: {
    accuracy: number;
    clarity: number;
    depth: number;
    relevance: number;
    timeEfficiency: number;
  }
}

export default function ScoreChart({ scores }: ScoreChartProps) {
  const data = [
    { subject: 'Accuracy', A: scores.accuracy, fullMark: 10 },
    { subject: 'Clarity', A: scores.clarity, fullMark: 10 },
    { subject: 'Depth', A: scores.depth, fullMark: 10 },
    { subject: 'Relevance', A: scores.relevance, fullMark: 10 },
    { subject: 'Efficiency', A: scores.timeEfficiency, fullMark: 10 },
  ];

  return (
    <div className="w-full h-[300px] mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 600 }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
          <Radar
            name="Score"
            dataKey="A"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            fill="hsl(var(--primary))"
            fillOpacity={0.3}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              borderColor: 'hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))'
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

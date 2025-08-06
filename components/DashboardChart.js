import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const DashboardChart = ({ data }) => {
  return (
    <div>
      <svg style={{ height: 0 }}>
        <defs>
          <filter id="glow" height="200%" width="200%" x="-50%" y="-50%" >
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#38a169" floodOpacity="0.8"/>
          </filter>
        </defs>
      </svg>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{
            top: 20, right: 30, left: 20, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
          <XAxis dataKey="period" stroke="#888" />
          <YAxis allowDecimals={false} stroke="#888" domain={[0, 'auto']} tickCount={5} />
          <Tooltip contentStyle={{ backgroundColor: '#222', borderRadius: '5px' }} />
          <Legend wrapperStyle={{ color: '#ccc' }} />
          <Line
            type="step"
            dataKey="frequency"
            stroke="#38a169"
            strokeWidth={3}
            filter="url(#glow)"
            dot={false}
            isAnimationActive={true}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DashboardChart;

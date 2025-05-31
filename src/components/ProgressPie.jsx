import React, { useEffect, useState } from 'react';
import '../styles/ProgressPie.css'

const ProgressPie = ({ percentage = 25, size = 60, strokeWidth = 6 }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate to target percentage
    const timeout = setTimeout(() => {
      setProgress(percentage);
    }, 100);
    return () => clearTimeout(timeout);
  }, [percentage]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="progress-pie-container">
      <svg
        width={size}
        height={size}
        className="progress-pie"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Foreground arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="white"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
        />
      </svg>
      
      {/* Percentage text overlay */}
      <div className="progress-text">
        {percentage}%
      </div>
    </div>
  );
};

export default ProgressPie;
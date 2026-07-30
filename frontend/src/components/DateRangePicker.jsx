import React from 'react';
import { Calendar } from 'lucide-react';

const DateRangePicker = () => {
  function formatTodayDate() {
    const d = new Date();
    const day = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'long' });
    const year = d.getFullYear();
    const suffix = (day % 10 === 1 && day !== 11) ? 'st' :
                   (day % 10 === 2 && day !== 12) ? 'nd' :
                   (day % 10 === 3 && day !== 13) ? 'rd' : 'th';
    return `${day}${suffix} ${month} ${year}`;
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '10px', padding: '7px 14px', fontSize: '0.85rem', color: '#e2e8f0',
      fontWeight: '600', userSelect: 'none'
    }}>
      <Calendar size={15} style={{ color: '#818cf8' }} />
      <span>{formatTodayDate()}</span>
    </div>
  );
};

export default DateRangePicker;

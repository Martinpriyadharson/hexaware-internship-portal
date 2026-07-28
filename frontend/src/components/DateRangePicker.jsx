import React, { useState } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';

const DateRangePicker = ({ onDateRangeChange }) => {
  // Compute default range dynamically for Today
  const defaultRange = getRange(0, 0);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(defaultRange.label);

  const presets = [
    { label: 'Today (Default)', getValue: () => getRange(0, 0) },
    { label: 'Yesterday', getValue: () => getRange(1, 1) },
    { label: 'Last 7 Days', getValue: () => getRange(7, 0) },
    { label: 'Last 30 Days', getValue: () => getRange(30, 0) },
    { label: 'This Month', getValue: () => getMonthRange(0) },
    { label: 'Previous Month', getValue: () => getMonthRange(1) },
    { label: 'All Records', getValue: () => ({ start: '', end: '', label: 'All Evaluated Records' }) }
  ];

  function formatSingleDate(d) {
    const day = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'long' });
    const year = d.getFullYear();
    const suffix = (day % 10 === 1 && day !== 11) ? 'st' :
                   (day % 10 === 2 && day !== 12) ? 'nd' :
                   (day % 10 === 3 && day !== 13) ? 'rd' : 'th';
    return `${day}${suffix} ${month} ${year}`;
  }

  function getRange(daysBackStart, daysBackEnd) {
    const end = new Date();
    end.setDate(end.getDate() - daysBackEnd);
    const start = new Date();
    start.setDate(start.getDate() - daysBackStart);

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    let label;
    if (startStr === endStr) {
      label = formatSingleDate(start);
    } else {
      label = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return { start: startStr, end: endStr, label };
  }

  function getMonthRange(monthsAgo) {
    const date = new Date();
    date.setMonth(date.getMonth() - monthsAgo);
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const startStr = firstDay.toISOString().split('T')[0];
    const endStr = lastDay.toISOString().split('T')[0];
    const label = `${firstDay.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
    return { start: startStr, end: endStr, label };
  }

  const handleSelect = (preset) => {
    const range = preset.getValue();
    setSelectedLabel(range.label);
    setIsOpen(false);
    if (onDateRangeChange) {
      onDateRangeChange(range.start, range.end, range.label);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '10px', padding: '7px 14px', fontSize: '0.85rem', color: '#e2e8f0',
          cursor: 'pointer', transition: 'all 0.2s ease', fontWeight: '500'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
      >
        <Calendar size={15} style={{ color: '#818cf8' }} />
        <span>{selectedLabel}</span>
        <ChevronDown size={14} style={{ color: '#94a3b8' }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute', right: 0, marginTop: '8px', width: '250px',
          background: '#0f1120', border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '14px', boxShadow: '0 10px 30px rgba(0,0,0,0.7)', padding: '8px',
          zIndex: 60
        }}>
          <div style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Select Date Preset</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '4px' }}>
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(p)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '8px 12px', borderRadius: '8px', border: 'none',
                  background: selectedLabel === p.label ? 'rgba(129, 140, 248, 0.15)' : 'transparent',
                  color: selectedLabel === p.label ? '#ffffff' : '#94a3b8',
                  fontSize: '0.825rem', cursor: 'pointer', textAlign: 'left', fontWeight: selectedLabel === p.label ? '600' : '400'
                }}
                onMouseEnter={(e) => {
                  if (selectedLabel !== p.label) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                }}
                onMouseLeave={(e) => {
                  if (selectedLabel !== p.label) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span>{p.label}</span>
                {selectedLabel === p.label && <Check size={14} style={{ color: '#818cf8' }} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;

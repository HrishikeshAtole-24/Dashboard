import { useState, useRef, useEffect } from 'react';
import { format, subDays, startOfDay } from 'date-fns';
import { Calendar } from '../icons';

export function DatePicker({ date, onDateChange, placeholder = "Pick a date" }) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`dropdown ${isOpen ? 'active' : ''}`} ref={popoverRef}>
      <button
        className="btn btn-secondary flex items-center justify-start"
        style={{ minWidth: '280px' }}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <Calendar className="icon-sm mr-2" />
        {date ? format(date, 'PPP') : <span>{placeholder}</span>}
      </button>
      
      {isOpen && (
        <div className="dropdown-content">
          <input
            type="date"
            value={date ? format(date, 'yyyy-MM-dd') : ''}
            onChange={(e) => {
              if (e.target.value) {
                onDateChange(new Date(e.target.value));
                setIsOpen(false);
              }
            }}
            className="form-input"
          />
        </div>
      )}
    </div>
  );
}

export function DateRangePicker({ date, setDate, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatDateRange = () => {
    if (date?.from) {
      if (date.to) {
        return `${format(date.from, 'MMM dd, yyyy')} - ${format(date.to, 'MMM dd, yyyy')}`;
      }
      return format(date.from, 'MMM dd, yyyy');
    }
    return 'Pick a date range';
  };

  const handlePresetClick = (preset) => {
    const today = new Date();
    let from, to;

    switch (preset) {
      case 'today':
        from = to = startOfDay(today);
        break;
      case 'yesterday':
        from = to = startOfDay(subDays(today, 1));
        break;
      case 'last7days':
        from = startOfDay(subDays(today, 6));
        to = startOfDay(today);
        break;
      case 'last30days':
        from = startOfDay(subDays(today, 29));
        to = startOfDay(today);
        break;
      case 'thisMonth':
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = startOfDay(today);
        break;
      default:
        return;
    }

    const newRange = { from, to };
    setDate(newRange);
    setIsOpen(false);
  };

  return (
    <div className={`dropdown ${isOpen ? 'active' : ''} ${className}`} ref={popoverRef}>
      <button
        className="btn btn-secondary flex items-center justify-start"
        style={{ minWidth: '280px' }}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <Calendar className="icon-sm mr-2" />
        {formatDateRange()}
      </button>
      
      {isOpen && (
        <div className="dropdown-content" style={{ minWidth: '300px', right: 0 }}>
          <div className="p-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-900 mb-3">Date Presets</h4>
              <button
                className="dropdown-item text-left"
                onClick={() => handlePresetClick('today')}
              >
                Today
              </button>
              <button
                className="dropdown-item text-left"
                onClick={() => handlePresetClick('yesterday')}
              >
                Yesterday
              </button>
              <button
                className="dropdown-item text-left"
                onClick={() => handlePresetClick('last7days')}
              >
                Last 7 days
              </button>
              <button
                className="dropdown-item text-left"
                onClick={() => handlePresetClick('last30days')}
              >
                Last 30 days
              </button>
              <button
                className="dropdown-item text-left"
                onClick={() => handlePresetClick('thisMonth')}
              >
                This month
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
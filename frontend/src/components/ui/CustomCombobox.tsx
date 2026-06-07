import { useState, useEffect, useRef } from 'react'
import type { ChangeEvent } from 'react'
import { ChevronDown } from 'lucide-react'

export interface ComboboxOption {
  value: string;
  label: string;
  color?: string;
}

interface CustomComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function CustomCombobox({
  value,
  onChange,
  options,
  placeholder,
  className = '',
  disabled = false,
}: CustomComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    if (!isOpen) setIsOpen(true)
  }

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
    }
  }

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes((value || '').toLowerCase()) || 
    opt.value.toLowerCase().includes((value || '').toLowerCase())
  )

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className={`
          w-full h-10 px-3 pr-8 flex items-center relative text-left
          bg-[rgb(26,26,30)] border border-[rgb(61,45,122,0.8)]
          rounded-lg text-[13px] text-[#c9c9d4]
          transition-all duration-200
          ${isOpen ? 'border-[rgb(124,92,191,0.9)] shadow-[0_0_0_2px_rgb(124,92,191,0.15)]' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[rgb(124,92,191,0.7)]'}
        `}
      >
        <input
          type="text"
          value={value || ''}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full h-full bg-transparent border-none outline-none text-[#c9c9d4] placeholder:text-[#6b7590]"
        />
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className="absolute right-0 top-0 bottom-0 px-3 flex items-center justify-center text-[#7c5cbf] hover:text-[#967ce2] transition-colors"
        >
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div
          className="absolute top-[calc(100%+4px)] left-0 right-0
          bg-[#15151a] border border-[#3d2d7a] rounded-lg
          z-50 min-w-full max-h-[220px] overflow-y-auto overflow-x-hidden
          [&::-webkit-scrollbar]:w-1
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-violet-500/20
          [&::-webkit-scrollbar-thumb]:rounded-full"
        >
          {filteredOptions.map((option, index) => (
            <div key={option.value}>
              {index > 0 && (
                <div className="h-[0.5px] bg-[#2a2a2e] mx-2" />
              )}
              <button
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full px-3 py-2 flex items-center gap-2
                  text-[13px] text-[#c9c9d4]
                  hover:bg-[rgb(61,45,122,0.3)]
                  transition-colors duration-150
                  cursor-pointer
                  ${value === option.value ? 'bg-[rgb(61,45,122,0.2)]' : ''}
                `}
              >
                {option.color && (
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: option.color }}
                  />
                )}
                <span className="flex-1 text-left">{option.label}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

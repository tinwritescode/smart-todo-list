import { useRef, useEffect } from "react";

interface SnoozeMenuProps {
  onSnooze: (minutes: number) => void;
  onClose: () => void;
}

export function SnoozeMenu({ onSnooze, onClose }: SnoozeMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const options = [
    { label: "10 minutes", minutes: 10 },
    { label: "30 minutes", minutes: 30 },
    { label: "1 hour", minutes: 60 },
    { label: "3 hours", minutes: 180 },
    { label: "1 day", minutes: 1440 },
  ];

  return (
    <div
      ref={menuRef}
      className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 py-1 border"
    >
      {options.map((option) => (
        <button
          key={option.minutes}
          onClick={() => {
            onSnooze(option.minutes);
            onClose();
          }}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

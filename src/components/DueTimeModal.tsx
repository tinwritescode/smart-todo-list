import { useRef, useState, useEffect } from "react";

interface DueTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (newDueTime: number) => void;
  currentDueTime?: number;
}

export function DueTimeModal({
  isOpen,
  onClose,
  onUpdate,
  currentDueTime,
}: DueTimeModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [selectedDate, setSelectedDate] = useState(
    currentDueTime
      ? new Date(currentDueTime).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [selectedTime, setSelectedTime] = useState(
    currentDueTime
      ? new Date(currentDueTime).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDueTime = new Date(`${selectedDate}T${selectedTime}`).getTime();
    onUpdate(newDueTime);
    onClose();
  };

  const setEndOfDay = (daysOffset: number = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    date.setHours(23, 59, 0, 0);

    setSelectedDate(date.toISOString().split("T")[0]);
    setSelectedTime("23:59");

    onUpdate(date.getTime());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Update Due Time</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time
            </label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div className="flex gap-2 mt-6">
            <button
              type="button"
              onClick={() => setEndOfDay(0)}
              className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              End of Today (23:59)
            </button>
            <button
              type="button"
              onClick={() => setEndOfDay(1)}
              className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              End of Tomorrow (23:59)
            </button>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface DailyResetModalProps {
  pastTasks: Array<{
    _id: Id<"todos">;
    text: string;
    dueTime?: number;
  }>;
  onClose: () => void;
  onCarryOver: (taskIds: Id<"todos">[]) => void;
}

export function DailyResetModal({ pastTasks, onClose, onCarryOver }: DailyResetModalProps) {
  const [selectedTasks, setSelectedTasks] = useState<Set<Id<"todos">>>(new Set());
  const updateSettings = useMutation(api.todos.updateUserSettings);

  const handleSelectAll = () => {
    if (selectedTasks.size === pastTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(pastTasks.map(task => task._id)));
    }
  };

  const handleTaskToggle = (taskId: Id<"todos">) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleCarryOver = async () => {
    if (selectedTasks.size > 0) {
      onCarryOver(Array.from(selectedTasks));
    }
    onClose();
  };

  const handleDismiss = () => {
    onClose();
  };

  const handleAlwaysCarryOver = async () => {
    await updateSettings({ rollOverTasks: true });
    if (pastTasks.length > 0) {
      onCarryOver(pastTasks.map(task => task._id));
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            🌅 Fresh Start!
          </h2>
          <p className="text-gray-600 mt-2">
            You had {pastTasks.length} incomplete task{pastTasks.length !== 1 ? 's' : ''} from yesterday. 
            Want to carry them over to today?
          </p>
        </div>

        <div className="p-4 max-h-60 overflow-y-auto">
          {pastTasks.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {selectedTasks.size === pastTasks.length ? 'Deselect All' : 'Select All'}
                </button>
                <span className="text-sm text-gray-500">
                  {selectedTasks.size} of {pastTasks.length} selected
                </span>
              </div>

              {pastTasks.map((task) => (
                <label
                  key={task._id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedTasks.has(task._id)}
                    onChange={() => handleTaskToggle(task._id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="flex-1 text-sm text-gray-700">
                    {task.text}
                  </span>
                  {task.dueTime && (
                    <span className="text-xs text-gray-500">
                      {new Date(task.dueTime).toLocaleDateString()}
                    </span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={handleCarryOver}
              disabled={selectedTasks.size === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Carry Over Selected ({selectedTasks.size})
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Start Fresh
            </button>
          </div>
          
          <button
            onClick={handleAlwaysCarryOver}
            className="w-full px-4 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-200 rounded hover:bg-blue-50"
          >
            Always carry over incomplete tasks
          </button>
        </div>
      </div>
    </div>
  );
}

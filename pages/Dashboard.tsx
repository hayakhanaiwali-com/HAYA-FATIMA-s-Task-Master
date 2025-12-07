import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Wand2, Circle, CheckCircle2, Pencil, X, Check } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { GeminiService } from '../services/geminiService';
import { Task, FilterType } from '../types';

export const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [filter, setFilter] = useState<FilterType>('all');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTasks(StorageService.getTasks());
  }, []);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const saveToStorage = (newTasks: Task[]) => {
    setTasks(newTasks);
    StorageService.saveTasks(newTasks);
  };

  const addTask = (text: string) => {
    if (!text.trim()) return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: text.trim(),
      completed: false,
      createdAt: Date.now()
    };
    saveToStorage([newTask, ...tasks]);
    setInputValue("");
  };

  const toggleTask = (id: string) => {
    const newTasks = tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveToStorage(newTasks);
  };

  const deleteTask = (id: string) => {
    const newTasks = tasks.filter(t => t.id !== id);
    saveToStorage(newTasks);
  };

  const startEditing = (task: Task) => {
    setEditingId(task.id);
    setEditValue(task.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEdit = () => {
    if (editingId && editValue.trim()) {
      const newTasks = tasks.map(t => 
        t.id === editingId ? { ...t, text: editValue.trim() } : t
      );
      saveToStorage(newTasks);
    }
    setEditingId(null);
    setEditValue("");
  };

  const handleMagicBreakdown = async (task: Task) => {
    setLoadingId(task.id);
    const subtasks = await GeminiService.breakDownTask(task.text);
    
    if (subtasks.length > 0) {
      // Create task objects for subtasks
      const newSubTasks: Task[] = subtasks.map(st => ({
        id: crypto.randomUUID(),
        text: st,
        completed: false,
        createdAt: Date.now()
      }));

      // Insert subtasks immediately after the parent task
      const taskIndex = tasks.findIndex(t => t.id === task.id);
      const newTaskList = [...tasks];
      newTaskList.splice(taskIndex + 1, 0, ...newSubTasks);
      
      saveToStorage(newTaskList);
    }
    setLoadingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addTask(inputValue);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') cancelEdit();
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const activeCount = tasks.filter(t => !t.completed).length;

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* Input Area */}
      <div className="relative">
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a new task..."
          className="w-full bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-4 pr-12 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-lg"
        />
        <button 
          onClick={() => addTask(inputValue)}
          className="absolute right-2 top-2 bottom-2 bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg transition-colors"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between bg-slate-900/50 p-1.5 rounded-xl border border-slate-800">
        <div className="flex gap-1">
          {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                filter === f 
                  ? 'bg-slate-700 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-500 px-3 font-mono">
          {activeCount} remaining
        </span>
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
            <p>No tasks found. Time to relax or get busy!</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div 
              key={task.id} 
              className={`group flex items-center gap-3 p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:bg-slate-800/80 transition-all ${task.completed ? 'opacity-60' : ''}`}
            >
              <button 
                onClick={() => toggleTask(task.id)}
                className={`shrink-0 transition-colors ${task.completed ? 'text-emerald-500' : 'text-slate-500 hover:text-emerald-400'}`}
              >
                {task.completed ? <CheckCircle2 size={24} className="fill-emerald-500/10" /> : <Circle size={24} />}
              </button>
              
              {editingId === task.id ? (
                 <div className="flex-1 flex gap-2">
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      className="flex-1 bg-slate-900 border border-indigo-500/50 rounded px-2 py-1 text-white focus:outline-none"
                    />
                    <button onClick={saveEdit} className="text-emerald-400 hover:bg-emerald-500/10 p-1 rounded"><Check size={18} /></button>
                    <button onClick={cancelEdit} className="text-red-400 hover:bg-red-500/10 p-1 rounded"><X size={18} /></button>
                 </div>
              ) : (
                <span className={`flex-1 text-lg truncate ${task.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                  {task.text}
                </span>
              )}

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!task.completed && editingId !== task.id && (
                  <>
                    <button 
                      onClick={() => handleMagicBreakdown(task)}
                      disabled={!!loadingId}
                      className={`p-2 rounded-lg text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 transition-colors ${loadingId === task.id ? 'animate-pulse cursor-wait' : ''}`}
                      title="AI Breakdown"
                    >
                      <Wand2 size={20} />
                    </button>
                    <button 
                      onClick={() => startEditing(task)}
                      className="p-2 rounded-lg text-slate-400 hover:bg-slate-500/10 hover:text-slate-300 transition-colors"
                      title="Edit Task"
                    >
                      <Pencil size={20} />
                    </button>
                  </>
                )}
                
                {editingId !== task.id && (
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-2 rounded-lg text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
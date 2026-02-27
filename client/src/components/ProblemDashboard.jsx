import React, { useMemo, useState } from 'react';

function ChevronLeftIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 4L14 10L8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const difficultyClass = (difficulty) => {
  if (!difficulty) return '';
  switch (difficulty.toLowerCase()) {
    case 'easy': return 'text-green-400';
    case 'medium': return 'text-yellow-400';
    case 'hard': return 'text-red-400';
    default: return '';
  }
};

export default function ProblemDashboard({
  problems,
  selectedTopic,
  onSelectTopic,
  searchQuery,
  onSearchQueryChange,
  onSelectProblem,
  selectedSlug,
  onToggleSidebar // Received from App.js
}) {
  const [isTopicCollapsed, setIsTopicCollapsed] = useState(false);

  const topics = useMemo(() => {
    const set = new Set();
    problems.forEach((p) => {
      (p.topics || []).forEach((t) => set.add(t));
    });
    return Array.from(set).sort();
  }, [problems]);

  const filteredProblems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return problems.filter((p) => {
      const matchesTopic = !selectedTopic || (p.topics || []).includes(selectedTopic);
      const matchesQuery = !q || p.title?.toLowerCase().includes(q) || p.slug?.toLowerCase().includes(q);
      return matchesTopic && matchesQuery;
    });
  }, [problems, selectedTopic, searchQuery]);

  return (
    <div className="flex h-full overflow-hidden">
      {/* SIDEBAR: Topics */}
      <aside className={`bg-panel border-r border-gray-800 flex flex-col transition-all ${isTopicCollapsed ? 'w-10' : 'w-48'}`}>
        <div className="p-3 border-b border-gray-800 flex items-center justify-between">
          {!isTopicCollapsed && <span className="text-xs font-bold text-gray-500 uppercase">Topics</span>}
          <button onClick={() => setIsTopicCollapsed(!isTopicCollapsed)} className="p-1 hover:bg-gray-700 rounded text-gray-400">
            {isTopicCollapsed ? <ChevronRightIcon className="w-3 h-3" /> : <ChevronLeftIcon className="w-3 h-3" />}
          </button>
        </div>
        {!isTopicCollapsed && (
          <div className="flex-1 overflow-y-auto p-2">
            <button 
              className={`w-full text-left px-2 py-1.5 rounded mb-1 text-sm ${!selectedTopic ? 'bg-accent text-white' : 'hover:bg-gray-800'}`}
              onClick={() => onSelectTopic(null)}
            >
              All Topics
            </button>
            {topics.map((topic) => (
              <button
                key={topic}
                className={`w-full text-left px-2 py-1.5 rounded text-sm mb-1 ${selectedTopic === topic ? 'bg-accent text-white' : 'hover:bg-gray-800'}`}
                onClick={() => onSelectTopic(topic)}
              >
                {topic}
              </button>
            ))}
          </div>
        )}
      </aside>

      {/* MAIN LIST: Problems table and controls */}
      <section className="flex-1 flex flex-col bg-background min-w-0">
        <div className="sticky top-0 z-10 bg-background border-b border-gray-800 px-4 py-3 flex items-center gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Search by title or slug..."
            className="flex-1 px-3 py-2 rounded bg-panel border border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <span className="text-xs text-gray-400 whitespace-nowrap">
            Showing {filteredProblems.length} / {problems.length}
          </span>
          
          {/* Collapse button aligned to the right, matching the restore button */}
          <button 
            type="button"
            onClick={onToggleSidebar}
            className="ml-auto p-1.5 hover:bg-gray-700 rounded text-gray-400 transition-colors"
            title="Hide Problem List"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-panel sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-300 border-b border-gray-700">Title</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-300 border-b border-gray-700">Difficulty</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-300 border-b border-gray-700">Topics</th>
              </tr>
            </thead>
            <tbody>
              {filteredProblems.map((p) => (
                <tr
                  key={p.slug}
                  className={`cursor-pointer hover:bg-gray-800/50 ${selectedSlug === p.slug ? 'bg-gray-800' : ''}`}
                  onClick={() => onSelectProblem(p)}
                >
                  <td className="px-4 py-3 border-b border-gray-800">
                    <div className="font-medium text-gray-100">{p.title}</div>
                    <div className="text-xs text-gray-500">{p.slug}</div>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-800">
                    <span className={difficultyClass(p.difficulty)}>{p.difficulty}</span>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-800">
                    <div className="flex flex-wrap gap-1">
                      {(p.topics || []).map((t) => (
                        <span key={t} className="px-2 py-0.5 rounded bg-gray-800 text-gray-400 text-[10px] uppercase">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

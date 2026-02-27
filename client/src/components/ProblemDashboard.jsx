import React, { useMemo, useState } from 'react';

function ChevronLeftIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 4L6 10L12 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 4L14 10L8 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const difficultyClass = (difficulty) => {
  if (!difficulty) return '';
  switch (difficulty.toLowerCase()) {
    case 'easy':
      return 'difficulty-easy';
    case 'medium':
      return 'difficulty-medium';
    case 'hard':
      return 'difficulty-hard';
    default:
      return '';
  }
};

export default function ProblemDashboard({
  problems,
  selectedTopic,
  onSelectTopic,
  searchQuery,
  onSearchQueryChange,
  onSelectProblem,
  selectedSlug
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      const matchesQuery =
        !q ||
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.slug && p.slug.toLowerCase().includes(q));
      return matchesTopic && matchesQuery;
    });
  }, [problems, selectedTopic, searchQuery]);

  return (
    <div className="flex h-full">
      <aside
        className={`bg-panel border-r border-gray-700 flex flex-col transition-all duration-200 ${
          isCollapsed ? 'w-8' : 'w-64'
        }`}
      >
        <div className="p-2 border-b border-gray-700 sticky top-0 bg-panel z-10 flex items-center justify-between">
          {!isCollapsed && <h2 className="text-lg font-semibold">Topics</h2>}
          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="flex items-center justify-center w-6 h-6 rounded hover:bg-gray-700 text-gray-300"
            title={isCollapsed ? 'Expand topics' : 'Collapse topics'}
          >
            {isCollapsed ? (
              <ChevronRightIcon className="w-3 h-3" />
            ) : (
              <ChevronLeftIcon className="w-3 h-3" />
            )}
          </button>
        </div>
        {!isCollapsed && (
          <>
            <div className="px-4 pt-2">
              <button
                className={`w-full text-left px-2 py-1 rounded mb-2 ${
                  !selectedTopic ? 'bg-accent text-white' : 'hover:bg-gray-700'
                }`}
                onClick={() => onSelectTopic(null)}
              >
                All Topics
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {topics.map((topic) => (
                <button
                  key={topic}
                  className={`w-full text-left px-2 py-1 rounded text-sm ${
                    selectedTopic === topic ? 'bg-accent text-white' : 'hover:bg-gray-700'
                  }`}
                  onClick={() => onSelectTopic(topic)}
                >
                  {topic}
                </button>
              ))}
            </div>
          </>
        )}
      </aside>
      <section className="flex-1 flex flex-col bg-background">
        <div className="sticky top-0 z-10 bg-background border-b border-gray-800 px-4 py-3 flex items-center gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            placeholder="Search by title or slug..."
            className="flex-1 px-3 py-2 rounded bg-panel border border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <span className="text-xs text-gray-400">
            Showing {filteredProblems.length} / {problems.length}
          </span>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-panel sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-300 border-b border-gray-700">
                  Title
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-300 border-b border-gray-700">
                  Difficulty
                </th>
                <th className="px-4 py-2 text-left font-semibold text-gray-300 border-b border-gray-700">
                  Topics
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProblems.map((p) => (
                <tr
                  key={p.slug}
                  className={`cursor-pointer hover:bg-panel ${
                    selectedSlug === p.slug ? 'bg-panel' : ''
                  }`}
                  onClick={() => onSelectProblem(p)}
                >
                  <td className="px-4 py-2 border-b border-gray-800">
                    <div className="font-medium text-gray-100">{p.title}</div>
                    <div className="text-xs text-gray-500">{p.slug}</div>
                  </td>
                  <td className="px-4 py-2 border-b border-gray-800">
                    <span className={difficultyClass(p.difficulty)}>{p.difficulty}</span>
                  </td>
                  <td className="px-4 py-2 border-b border-gray-800">
                    <div className="flex flex-wrap gap-1">
                      {(p.topics || []).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 text-xs"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProblems.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-6 text-center text-gray-500 text-sm border-b border-gray-800"
                  >
                    No problems match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}


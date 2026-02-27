import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import ProblemDashboard from './components/ProblemDashboard';
import Workspace from './components/Workspace';

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

export default function App() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProblem, setSelectedProblem] = useState(null);

  const [showDashboard, setShowDashboard] = useState(true);
  const [dashboardWidth, setDashboardWidth] = useState(40);
  const mainRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await axios.get('/api/problems');
        if (!cancelled) {
          setProblems(res.data || []);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError('Failed to load problems');
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelectProblem = (problem) => {
    setSelectedProblem(problem);
  };

  const handleOuterDividerMouseDown = (e) => {
    e.preventDefault();
    const container = mainRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    const onMouseMove = (moveEvent) => {
      const offsetX = moveEvent.clientX - rect.left;
      let next = (offsetX / rect.width) * 100;
      next = Math.min(75, Math.max(20, next));
      setDashboardWidth(next);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const layoutSignal = showDashboard ? `dashboard-${dashboardWidth}` : 'full-workspace';

  return (
    <div className="h-screen flex flex-col bg-background text-gray-100">
      <header className="h-14 flex items-center justify-between px-4 border-b border-gray-800 bg-panel sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold">CU LeetCode Clone</span>
          <span className="text-xs text-gray-400 hidden sm:inline">
            2,848 verified problems • React + Node.js
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <nav className="hidden sm:flex items-center gap-4">
            <span className="hover:text-gray-100 cursor-default">Dashboard</span>
            <span className="hover:text-gray-100 cursor-default">Workspace</span>
          </nav>
          <button
            type="button"
            onClick={() => setShowDashboard((prev) => !prev)}
            className="flex items-center gap-1 px-2 py-1 rounded border border-gray-700 hover:border-accent hover:text-gray-100 text-xs bg-background"
          >
            {showDashboard ? (
              <ChevronLeftIcon className="w-3 h-3" />
            ) : (
              <ChevronRightIcon className="w-3 h-3" />
            )}
            <span className="hidden md:inline">
              {showDashboard ? 'Hide Problems' : 'Show Problems'}
            </span>
          </button>
        </div>
      </header>

      {loading && (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          Loading problems...
        </div>
      )}
      {error && !loading && (
        <div className="flex-1 flex items-center justify-center text-red-400 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <main ref={mainRef} className="flex-1 flex overflow-hidden">
          {showDashboard && (
            <>
              <div
                className="h-full border-r border-gray-900 flex flex-col"
                style={{ width: `${dashboardWidth}%` }}
              >
                <ProblemDashboard
                  problems={problems}
                  selectedTopic={selectedTopic}
                  onSelectTopic={setSelectedTopic}
                  searchQuery={searchQuery}
                  onSearchQueryChange={setSearchQuery}
                  onSelectProblem={handleSelectProblem}
                  selectedSlug={selectedProblem?.slug}
                />
              </div>
              <div
                className="w-1 bg-gray-800 hover:bg-accent cursor-col-resize"
                onMouseDown={handleOuterDividerMouseDown}
                role="separator"
                aria-orientation="vertical"
              />
            </>
          )}
          <div className="flex-1 flex flex-col bg-background">
            <Workspace problem={selectedProblem} layoutSignal={layoutSignal} />
          </div>
        </main>
      )}
    </div>
  );
}


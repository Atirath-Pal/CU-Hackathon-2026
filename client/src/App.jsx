import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import ProblemDashboard from './components/ProblemDashboard';
import Workspace from './components/Workspace';
import Login from './components/login';
import Welcome from './components/Welcome';

function ChevronRightIcon({ className = '' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 4L14 10L8 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
  const [dashboardWidth, setDashboardWidth] = useState(40);
  
  // Controls the visibility of the Problem List (middle section)
  const [showProblemList, setShowProblemList] = useState(true);
  
  const mainRef = useRef(null);
  const isAuthenticated = !!localStorage.getItem('userId');

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
        if (!cancelled) {
          setError('Failed to load problems');
          setLoading(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

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

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />

        <Route path="/dashboard" element={
          isAuthenticated ? (
            <div className="h-screen flex flex-col bg-background text-gray-100">
              <header className="h-14 flex items-center justify-between px-4 border-b border-gray-800 bg-panel sticky top-0 z-20">
                <span className="text-lg font-semibold">CU LeetCode Clone</span>
                <button
                  onClick={() => {
                    localStorage.removeItem('userId');
                    window.location.href = '/';
                  }}
                  className="px-3 py-1 bg-red-600 rounded text-xs hover:bg-red-500 font-bold text-white"
                >
                  Logout
                </button>
              </header>

              {!loading && !error && (
                <main ref={mainRef} className="flex-1 flex overflow-hidden">
                  
                  {/* MIDDLE SECTION: Problems & Topics */}
                  {showProblemList ? (
                    <>
                      <div className="h-full border-r border-gray-900 flex flex-col bg-panel" style={{ width: `${dashboardWidth}%` }}>
                        <ProblemDashboard
                          problems={problems}
                          selectedTopic={selectedTopic}
                          onSelectTopic={setSelectedTopic}
                          searchQuery={searchQuery}
                          onSearchQueryChange={setSearchQuery}
                          onSelectProblem={setSelectedProblem}
                          selectedSlug={selectedProblem?.slug}
                          /* Pass the function to hide the list */
                          onToggleSidebar={() => setShowProblemList(false)} 
                        />
                      </div>
                      <div className="w-1 bg-gray-800 hover:bg-accent cursor-col-resize" onMouseDown={handleOuterDividerMouseDown} />
                    </>
                  ) : (
                    /* Strip to bring the list back */
                    <div className="w-10 border-r border-gray-900 flex justify-center items-start pt-3 bg-background">
                      <button 
                        onClick={() => setShowProblemList(true)} 
                        className="p-1.5 hover:bg-gray-700 rounded text-gray-400 transition-colors"
                        title="Show Problems"
                      >
                        <ChevronRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* RIGHT SECTION: Workspace (Expands automatically) */}
                  <div className="flex-1 flex flex-col bg-background">
                    <Workspace 
                      problem={selectedProblem} 
                      layoutSignal={showProblemList ? 'expanded' : 'full'} 
                    />
                  </div>
                </main>
              )}
            </div>
          ) : <Navigate to="/login" />
        } />
      </Routes>
    </Router>
  );
}

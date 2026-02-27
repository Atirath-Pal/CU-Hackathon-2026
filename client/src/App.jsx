
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import ProblemDashboard from './components/ProblemDashboard';
import Workspace from './components/Workspace';
import Login from './components/login';
import Welcome from './components/Welcome';


// Keep these icon functions at the top as they are
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

export default function App() {
  // --- KEEP ALL THIS STATE LOGIC ---
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
    return () => { cancelled = true; };
  }, []);

  const handleSelectProblem = (problem) => { setSelectedProblem(problem); };

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
  // --- END OF STATE LOGIC ---

  //   return (
  //     <Router>
  //       <Routes>
  //         {/* Login Page Route */}
  //         <Route path="/login" element={<Login />} />

  //         {/* Main Dashboard Route */}
  //         <Route path="/" element={
  //           <div className="h-screen flex flex-col bg-background text-gray-100">
  //             <header className="h-14 flex items-center justify-between px-4 border-b border-gray-800 bg-panel sticky top-0 z-20">
  //               <div className="flex items-center gap-3">
  //                 <span className="text-lg font-semibold">CU LeetCode Clone</span>
  //               </div>
  //               <button
  //                 type="button"
  //                 onClick={() => setShowDashboard((prev) => !prev)}
  //                 className="flex items-center gap-1 px-2 py-1 rounded border border-gray-700 text-xs"
  //               >
  //                 {showDashboard ? <ChevronLeftIcon className="w-3 h-3" /> : <ChevronRightIcon className="w-3 h-3" />}
  //                 <span>{showDashboard ? 'Hide Problems' : 'Show Problems'}</span>
  //               </button>
  //               <button
  //                 type="button"
  //                 onClick={() => setShowDashboard((prev) => !prev)}
  //                 className="flex items-center gap-1 px-2 py-1 rounded border border-gray-700 text-xs"
  //               >
  //                 {showDashboard ? <ChevronLeftIcon className="w-3 h-3" /> : <ChevronRightIcon className="w-3 h-3" />}
  //                 <span>{showDashboard ? 'Hide Problems' : 'Show Problems'}</span>
  //               </button>

  //               {/* --- ADD THIS NEW BUTTON HERE --- */}
  //               <button
  //                 onClick={() => window.location.href = '/login'}
  //                 className="px-3 py-1 bg-blue-600 rounded text-xs hover:bg-blue-500 font-bold text-white ml-2"
  //               >
  //                 Login
  //               </button>

  //             </header>

  //             {loading && <div className="flex-1 flex items-center justify-center">Loading problems...</div>}
  //             {error && !loading && <div className="flex-1 flex items-center justify-center text-red-400">{error}</div>}

  //             {!loading && !error && (
  //               <main ref={mainRef} className="flex-1 flex overflow-hidden">
  //                 {showDashboard && (
  //                   <>
  //                     <div className="h-full border-r border-gray-900" style={{ width: `${dashboardWidth}%` }}>
  //                       <ProblemDashboard
  //                         problems={problems}
  //                         selectedTopic={selectedTopic}
  //                         onSelectTopic={setSelectedTopic}
  //                         searchQuery={searchQuery}
  //                         onSearchQueryChange={setSearchQuery}
  //                         onSelectProblem={handleSelectProblem}
  //                         selectedSlug={selectedProblem?.slug}
  //                       />
  //                     </div>
  //                     <div className="w-1 bg-gray-800 hover:bg-accent cursor-col-resize" onMouseDown={handleOuterDividerMouseDown} />
  //                   </>
  //                 )}
  //                 <div className="flex-1 flex flex-col bg-background">
  //                   <Workspace problem={selectedProblem} layoutSignal={layoutSignal} />
  //                 </div>
  //               </main>
  //             )}
  //           </div>
  //         } />
  //       </Routes>
  //     </Router >
  //   );
  // }

  const isAuthenticated = !!localStorage.getItem('userId');

  return (
    <Router>
      <Routes>
        {/* 1. PUBLIC WELCOME PAGE: The new entry point of your app */}
        <Route path="/" element={<Welcome />} />

        {/* 2. LOGIN PAGE: Redirects to /dashboard if user is already logged in */}
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
        />

        {/* 3. PROTECTED DASHBOARD: The coding environment now lives at /dashboard */}
        <Route
          path="/dashboard"
          element={
            /* Step 1: Remove the isAuthenticated check here */
            <div className="h-screen flex flex-col bg-background text-gray-100">
              <header className="h-14 flex items-center justify-between px-4 border-b border-gray-800 bg-panel sticky top-0 z-20">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold">CU LeetCode Clone</span>
                  {/* Step 2: Show Guest Label if not logged in */}
                  {!isAuthenticated && (
                    <span className="text-[10px] bg-yellow-600/20 text-yellow-500 border border-yellow-500/50 px-2 py-0.5 rounded">
                      Guest Mode (Read Only)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDashboard((prev) => !prev)}
                    className="flex items-center gap-1 px-2 py-1 rounded border border-gray-700 text-xs"
                  >
                    {showDashboard ? <ChevronLeftIcon className="w-3 h-3" /> : <ChevronRightIcon className="w-3 h-3" />}
                    <span>{showDashboard ? 'Hide Problems' : 'Show Problems'}</span>
                  </button>

                  {/* Step 3: Show Login button for guests, Logout for users */}
                  {isAuthenticated ? (
                    <button
                      onClick={() => {
                        localStorage.removeItem('userId');
                        window.location.href = '/';
                      }}
                      className="px-3 py-1 bg-red-600 rounded text-xs hover:bg-red-500 font-bold text-white ml-2"
                    >
                      Logout
                    </button>
                  ) : (
                    <button
                      onClick={() => window.location.href = '/login'}
                      className="px-3 py-1 bg-blue-600 rounded text-xs hover:bg-blue-500 font-bold text-white ml-2"
                    >
                      Login to Solve
                    </button>
                  )}
                </div>
              </header>

              {loading && <div className="flex-1 flex items-center justify-center">Loading problems...</div>}
              {error && !loading && <div className="flex-1 flex items-center justify-center text-red-400">{error}</div>}

              {!loading && !error && (
                <main ref={mainRef} className="flex-1 flex overflow-hidden">
                  {showDashboard && (
                    <>
                      <div className="h-full border-r border-gray-900" style={{ width: `${dashboardWidth}%` }}>
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
                      <div className="w-1 bg-gray-800 hover:bg-accent cursor-col-resize" onMouseDown={handleOuterDividerMouseDown} />
                    </>
                  )}
                  <div className="flex-1 flex flex-col bg-background">
                    {/* Step 4: Pass isAuthenticated to the Workspace */}
                    <Workspace
                      problem={selectedProblem}
                      layoutSignal={layoutSignal}
                      isAuthenticated={isAuthenticated}
                    />
                  </div>
                </main>
              )}
            </div>
          }
        />
      </Routes>
    </Router>
  );
}
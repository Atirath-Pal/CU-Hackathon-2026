import React from 'react';

const Welcome = () => {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-6xl font-extrabold text-blue-500 mb-4">CU LeetCode</h1>
            <p className="text-xl text-gray-400 mb-10 max-w-lg">
                The platform for students to master coding, share knowledge, and level up their careers.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                {/* Card 1 */}
                <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-blue-500 transition cursor-pointer group" onClick={() => window.location.href = '/dashboard'}>
                    <h3 className="text-2xl font-bold mb-2">Try Problems</h3>
                    <p className="text-gray-400 text-sm">Solve 500+ coding challenges from our database.</p>
                    <div className="mt-4 text-blue-400 font-semibold group-hover:underline">Get Started &rarr;</div>
                </div>

                {/* Card 2 */}
                <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-blue-500 transition cursor-pointer group" onClick={() => window.location.href = '/login'}>
                    <h3 className="text-2xl font-bold mb-2">Create Blogs</h3>
                    <p className="text-gray-400 text-sm">Share your interview experiences and logic.</p>
                    <div className="mt-4 text-blue-400 font-semibold group-hover:underline">Write Now &rarr;</div>
                </div>

                {/* Card 3 */}
                <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-blue-500 transition cursor-pointer group" onClick={() => window.location.href = '/login'}>
                    <h3 className="text-2xl font-bold mb-2">Buy Course</h3>
                    <p className="text-gray-400 text-sm">Premium DSA roadmaps specifically for placements.</p>
                    <div className="mt-4 text-blue-400 font-semibold group-hover:underline">Explore &rarr;</div>
                </div>
            </div>

            <button
                onClick={() => window.location.href = '/login'}
                className="mt-12 px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-bold text-lg transition"
            >
                Sign In to Your Account
            </button>
        </div>
    );
};

export default Welcome;
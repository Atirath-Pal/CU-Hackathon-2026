import React, { useState } from 'react';

const Login = () => {
    // State to toggle between forms: 'login', 'register', or 'forgot'
    const [view, setView] = useState('login');

    // Form input states
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [message, setMessage] = useState('');

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const response = await fetch('http://localhost:4000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (data.success) {
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('isVerified', 'true');
                window.location.href = '/dashboard';
            } else {
                setMessage(data.message || "Login failed");
            }
        } catch (err) {
            console.error("Login error:", err);
            setMessage("An error occurred during login.");
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        if (password !== confirmPassword) {
            setMessage("Passwords do not match!");
            return;
        }

        setMessage('Sending verification email...');
        try {
            // This hits the backend route we are about to build
            const response = await fetch('http://localhost:4000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await response.json();
            if (data.success) {
                setMessage("Registration started! Please check your email to verify your account.");
            } else {
                setMessage(data.message || "Registration failed");
            }
        } catch (err) {
            console.error("Register error:", err);
            setMessage("An error occurred. Please try again.");
        }
    };

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setMessage('Sending password reset link...');
        try {
            const response = await fetch('http://localhost:4000/api/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (data.success) {
                setMessage("Check your email for the reset link!");
            } else {
                setMessage(data.message || "Failed to send reset link.");
            }
        } catch (err) {
            console.error("Forgot password error:", err);
            setMessage("An error occurred. Please try again.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <h1 className="text-2xl font-bold mb-4">
                {view === 'login' && "Login to Code Assistant"}
                {view === 'register' && "Create an Account"}
                {view === 'forgot' && "Reset Your Password"}
            </h1>

            {message && <p className="mb-4 text-yellow-400 text-center max-w-xs">{message}</p>}

            {/* LOGIN FORM */}
            {view === 'login' && (
                <form onSubmit={handleLoginSubmit} className="flex flex-col bg-gray-800 p-8 rounded shadow-lg w-80">
                    <input
                        type="text"
                        placeholder="Username"
                        className="border border-gray-600 bg-gray-700 p-2 m-2 rounded focus:outline-none focus:border-blue-500"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="border border-gray-600 bg-gray-700 p-2 m-2 rounded focus:outline-none focus:border-blue-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-2 m-2 rounded font-bold transition">
                        Login
                    </button>

                    <div className="flex flex-col items-center mt-4 space-y-2">
                        <button
                            type="button"
                            onClick={() => { setView('forgot'); setMessage(''); }}
                            className="text-sm text-blue-400 hover:text-blue-300"
                        >
                            Forgot Password?
                        </button>
                        <span className="text-sm text-gray-400">
                            New? <button type="button" onClick={() => { setView('register'); setMessage(''); }} className="text-blue-400 hover:text-blue-300 font-semibold">Register here</button>
                        </span>
                    </div>
                </form>
            )}

            {/* REGISTER FORM */}
            {view === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="flex flex-col bg-gray-800 p-8 rounded shadow-lg w-80">
                    <input
                        type="text"
                        placeholder="Username"
                        className="border border-gray-600 bg-gray-700 p-2 m-2 rounded focus:outline-none focus:border-blue-500"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="border border-gray-600 bg-gray-700 p-2 m-2 rounded focus:outline-none focus:border-blue-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="border border-gray-600 bg-gray-700 p-2 m-2 rounded focus:outline-none focus:border-blue-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        className="border border-gray-600 bg-gray-700 p-2 m-2 rounded focus:outline-none focus:border-blue-500"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white p-2 m-2 rounded font-bold transition">
                        Register
                    </button>
                    <button
                        type="button"
                        onClick={() => { setView('login'); setMessage(''); }}
                        className="text-sm text-gray-400 hover:text-gray-300 mt-4"
                    >
                        &larr; Already have an account? Login
                    </button>
                </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {view === 'forgot' && (
                <form onSubmit={handleForgotSubmit} className="flex flex-col bg-gray-800 p-8 rounded shadow-lg w-80">
                    <p className="text-sm text-gray-300 mb-4 px-2 text-center">
                        Enter your registered email address and we'll send you a link to reset your password.
                    </p>
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="border border-gray-600 bg-gray-700 p-2 m-2 rounded focus:outline-none focus:border-blue-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-2 m-2 rounded font-bold transition">
                        Send Reset Link
                    </button>
                    <button
                        type="button"
                        onClick={() => { setView('login'); setMessage(''); }}
                        className="text-sm text-gray-400 hover:text-gray-300 mt-4"
                    >
                        &larr; Back to Login
                    </button>
                </form>
            )}
        </div>
    );
};

export default Login;
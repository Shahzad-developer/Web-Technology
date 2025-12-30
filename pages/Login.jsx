import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signIn(email, password);
            navigate('/feed');
        } catch (err) {
            setError(err.message || 'Failed to sign in');
        }
        setLoading(false);
    };

    return (
        <div className="font-display bg-[#111722] text-white min-h-screen flex flex-col">
            {/* Header */}
            <header className="w-full border-b border-[#324467] bg-[#111722]/95 backdrop-blur-md sticky top-0 z-50">
                <div className="px-6 md:px-12 h-16 flex items-center justify-between max-w-[1440px] mx-auto w-full">
                    <Link to="/landing" className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[20px]">hub</span>
                        </div>
                        <h2 className="text-white text-lg font-bold tracking-tight">ObrixChat</h2>
                    </Link>
                    <button className="flex items-center gap-2 text-sm font-medium text-[#92a4c9] hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-[18px]">help</span>
                        <span>Help/Support</span>
                    </button>
                </div>
            </header>

            {/* Main */}
            <main className="flex-1 flex w-full relative">
                {/* Background decorative elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
                    <div className="absolute top-[40%] right-[10%] w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[100px]" />
                </div>

                <div className="w-full h-full flex flex-col md:flex-row max-w-[1440px] mx-auto z-10">
                    {/* Left Panel: Brand */}
                    <div className="hidden md:flex md:w-5/12 lg:w-1/2 flex-col justify-center p-12 lg:p-20 relative">
                        <div className="relative z-10 flex flex-col gap-8">
                            <div className="space-y-4">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider w-fit">
                                    Student Exclusive
                                </span>
                                <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-[-0.02em] text-white">
                                    Welcome <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Back.</span>
                                </h1>
                                <p className="text-lg text-[#92a4c9] max-w-md leading-relaxed">
                                    Sign in to continue connecting with your campus community. Your network awaits.
                                </p>
                            </div>

                            {/* Feature Grid */}
                            <div className="grid grid-cols-2 gap-6 mt-4">
                                <div className="flex flex-col gap-2">
                                    <div className="size-10 rounded-lg bg-[#192233] border border-[#324467] flex items-center justify-center text-white mb-1">
                                        <span className="material-symbols-outlined">groups</span>
                                    </div>
                                    <h3 className="font-bold text-white">Study Groups</h3>
                                    <p className="text-sm text-[#92a4c9]">Find peers in your major instantly.</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="size-10 rounded-lg bg-[#192233] border border-[#324467] flex items-center justify-center text-white mb-1">
                                        <span className="material-symbols-outlined">video_camera_front</span>
                                    </div>
                                    <h3 className="font-bold text-white">HD Video</h3>
                                    <p className="text-sm text-[#92a4c9]">Crystal clear lectures and calls.</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="size-10 rounded-lg bg-[#192233] border border-[#324467] flex items-center justify-center text-white mb-1">
                                        <span className="material-symbols-outlined">forum</span>
                                    </div>
                                    <h3 className="font-bold text-white">Real-time Chat</h3>
                                    <p className="text-sm text-[#92a4c9]">Seamless messaging for teams.</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="size-10 rounded-lg bg-[#192233] border border-[#324467] flex items-center justify-center text-white mb-1">
                                        <span className="material-symbols-outlined">verified</span>
                                    </div>
                                    <h3 className="font-bold text-white">Verified Users</h3>
                                    <p className="text-sm text-[#92a4c9]">Safe community with .edu checks.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Auth Form */}
                    <div className="w-full md:w-7/12 lg:w-1/2 flex items-center justify-center p-4 md:p-12">
                        <div className="w-full max-w-[480px] bg-[#192233]/50 backdrop-blur-xl border border-[#324467] rounded-2xl p-6 sm:p-8 shadow-2xl">
                            {/* Tabs */}
                            <div className="flex border-b border-[#324467] mb-8">
                                <Link to="/signup" className="flex-1 pb-4 border-b-2 border-transparent text-[#92a4c9] font-semibold text-sm tracking-wide hover:text-white transition-colors text-center">
                                    Sign Up
                                </Link>
                                <button className="flex-1 pb-4 border-b-2 border-primary text-white font-semibold text-sm tracking-wide transition-colors">
                                    Log In
                                </button>
                            </div>

                            {/* Heading */}
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                                <p className="text-[#92a4c9] text-sm">Sign in to your account to continue.</p>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-white">Email</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-[#92a4c9] text-[20px]">mail</span>
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-[#192233] border border-[#324467] rounded-lg py-3 pl-10 pr-4 text-white placeholder-[#92a4c9] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                            placeholder="your@email.com"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-sm font-medium text-white">Password</label>
                                        <a href="#" className="text-xs text-primary hover:text-blue-400 transition-colors">Forgot password?</a>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="material-symbols-outlined text-[#92a4c9] text-[20px]">lock</span>
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-[#192233] border border-[#324467] rounded-lg py-3 pl-10 pr-10 text-white placeholder-[#92a4c9] focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                            placeholder="Enter your password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#92a4c9] hover:text-white transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility' : 'visibility_off'}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="mt-2 w-full bg-primary hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-lg transition-all transform active:scale-[0.98] shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
                                    ) : (
                                        <>
                                            <span>Sign In</span>
                                            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-[#324467]" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-[#192233]/50 px-2 text-[#92a4c9] backdrop-blur-sm">Or continue with</span>
                                </div>
                            </div>

                            {/* Social Login */}
                            <div className="grid grid-cols-2 gap-4">
                                <button className="flex items-center justify-center gap-2 bg-[#192233] border border-[#324467] hover:bg-[#252f44] text-white py-2.5 px-4 rounded-lg transition-colors text-sm font-medium">
                                    <span className="material-symbols-outlined text-blue-500">work</span>
                                    LinkedIn
                                </button>
                                <button className="flex items-center justify-center gap-2 bg-[#192233] border border-[#324467] hover:bg-[#252f44] text-white py-2.5 px-4 rounded-lg transition-colors text-sm font-medium">
                                    <span className="material-symbols-outlined text-red-500">mail</span>
                                    Google
                                </button>
                            </div>

                            <div className="mt-8 text-center">
                                <p className="text-sm text-[#92a4c9]">
                                    Don't have an account?{' '}
                                    <Link to="/signup" className="text-primary font-semibold hover:text-blue-400 transition-colors">
                                        Sign Up
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Login;

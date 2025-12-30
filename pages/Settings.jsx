import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { profileService } from '../services/profileService';
import { connectionService } from '../services/connectionService';
import { supabase } from '../supabase';
import MainLayout from '../components/layout/MainLayout';

const Settings = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('account');
    const [loading, setLoading] = useState(true);

    // Profile Settings State
    const [visibility, setVisibility] = useState('everyone');
    const [activeStatus, setActiveStatus] = useState(true);
    const [readReceipts, setReadReceipts] = useState(false);
    const [pushNotifications, setPushNotifications] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [blockedUsers, setBlockedUsers] = useState([]);

    // Account Form State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');

    useEffect(() => {
        if (user?.email) {
            loadSettings();
        }
    }, [user?.email]);

    const loadSettings = async () => {
        setLoading(true);
        try {
            // Load Profile Data
            const profile = await profileService.getOrCreateProfile(user.email);
            if (profile) {
                setVisibility(profile.visibility || (profile.is_public ? 'everyone' : 'private'));
                setActiveStatus(profile.show_active_status ?? true);
                setReadReceipts(profile.read_receipts ?? false);
                setPushNotifications(profile.push_notifications ?? true);
                setEmailNotifications(profile.email_notifications ?? true);
            }

            // Load Blocked Users
            const blockedEmails = await connectionService.getBlockedUsers(user.email);
            // Fetch profiles for blocked users (mock or real)
            // Ideally we'd have a batch fetch, for now loop is okay for small sets
            const profiles = await Promise.all(
                blockedEmails.map(async (email) => {
                    const p = await profileService.getProfile(email);
                    return p || { email, full_name: email, avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}` };
                })
            );
            setBlockedUsers(profiles);

        } catch (error) {
            console.error('Error loading settings:', error);
        }
        setLoading(false);
    };

    const handleUpdateSetting = async (key, value) => {
        // Optimistic Update
        if (key === 'visibility') setVisibility(value);
        if (key === 'activeStatus') setActiveStatus(value);
        if (key === 'readReceipts') setReadReceipts(value);
        if (key === 'pushNotifications') setPushNotifications(value);
        if (key === 'emailNotifications') setEmailNotifications(value);

        try {
            const updates = {};
            if (key === 'visibility') {
                updates.visibility = value;
                updates.is_public = value === 'everyone';
            }
            if (key === 'activeStatus') updates.show_active_status = value;
            if (key === 'readReceipts') updates.read_receipts = value;
            if (key === 'pushNotifications') updates.push_notifications = value;
            if (key === 'emailNotifications') updates.email_notifications = value;

            await profileService.updateProfile(user.email, updates);
        } catch (error) {
            console.error(`Error updating ${key}:`, error);
            // Revert state if needed (skipped for brevity)
        }
    };

    const handleUnblock = async (blockedEmail) => {
        try {
            await connectionService.unblockUser(user.email, blockedEmail);
            setBlockedUsers(blockedUsers.filter(u => u.email !== blockedEmail));
        } catch (error) {
            console.error('Error unblocking user:', error);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordMessage('');
        if (newPassword !== confirmPassword) {
            setPasswordMessage('Passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            setPasswordMessage('Password must be at least 6 characters');
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            setPasswordMessage('Password updated successfully');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setPasswordMessage(`Error: ${err.message}`);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut();
            navigate('/login');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    const tabs = [
        { id: 'account', label: 'Account & Security', icon: 'account_circle' },
        { id: 'privacy', label: 'Privacy & Visibility', icon: 'lock' },
        { id: 'notifications', label: 'Notifications', icon: 'notifications' },
        { id: 'blocked', label: 'Blocked Accounts', icon: 'block' },
    ];

    if (loading) {
        return (
            <div className="flex flex-1 items-center justify-center h-screen bg-[#f6f6f8] dark:bg-[#101622]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <MainLayout rightSidebar={null} disableScroll={true}>
            <div className="h-full p-4 md:p-6">
                <div className="flex overflow-hidden h-full bg-white dark:bg-[#1e2736] rounded-xl border border-slate-200 dark:border-[#232f48] shadow-sm">

                    {/* Settings Sidebar */}
                    <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200 dark:border-[#232f48] bg-slate-50/50 dark:bg-[#111722]/50 p-4 gap-6 shrink-0 overflow-y-auto">
                        <div className="flex flex-col gap-1">
                            <h2 className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Settings</h2>
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${activeTab === tab.id
                                            ? 'bg-primary/10 text-primary dark:text-white dark:bg-primary/20 border-l-4 border-primary'
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#232f48]'
                                        }`}
                                >
                                    <span className={`material-symbols-outlined text-[20px] ${activeTab === tab.id ? 'text-primary dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                        {tab.icon}
                                    </span>
                                    <span className="text-sm font-medium">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                        <div className="mt-auto pt-6 border-t border-slate-200 dark:border-[#232f48]">
                            <button
                                onClick={handleLogout}
                                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[20px]">logout</span>
                                <span className="text-sm font-medium">Log Out</span>
                            </button>
                        </div>
                    </aside>

                    {/* Main Settings Content */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-8">
                        <div className="max-w-3xl mx-auto space-y-8 pb-10">

                            {/* Account & Security */}
                            {activeTab === 'account' && (
                                <div className="space-y-6">
                                    <div className="flex flex-col gap-2">
                                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Account & Security</h2>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">Update your personal account information and security settings.</p>
                                    </div>

                                    <div className="bg-transparent space-y-6">
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-[#232f48] pb-2">
                                                Email Address
                                            </h3>
                                            <div className="p-4 rounded-lg border border-slate-200 dark:border-[#232f48] bg-slate-50/50 dark:bg-[#111722]">
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{user.email}</p>
                                                <p className="text-xs text-slate-500 mt-1">Your email address is managed via your identity provider.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-[#232f48] pb-2">
                                                Change Password
                                            </h3>
                                            <form onSubmit={handlePasswordChange} className="p-6 rounded-lg border border-slate-200 dark:border-[#232f48] bg-slate-50/50 dark:bg-[#111722] space-y-4">
                                                <div>
                                                    <label className="text-sm font-medium text-slate-700 dark:text-[#92a4c9] block mb-1">New Password</label>
                                                    <input
                                                        type="password"
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                        className="w-full bg-white dark:bg-[#1e2736] border border-slate-200 dark:border-[#3b4c6b] rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                                        placeholder="••••••••"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-slate-700 dark:text-[#92a4c9] block mb-1">Confirm New Password</label>
                                                    <input
                                                        type="password"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        className="w-full bg-white dark:bg-[#1e2736] border border-slate-200 dark:border-[#3b4c6b] rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                                        placeholder="••••••••"
                                                    />
                                                </div>
                                                {passwordMessage && (
                                                    <p className={`text-sm ${passwordMessage.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>{passwordMessage}</p>
                                                )}
                                                <button type="submit" className="bg-primary hover:bg-blue-600 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors shadow-md">
                                                    Update Password
                                                </button>
                                            </form>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-lg font-bold text-red-600 flex items-center gap-2 border-b border-slate-200 dark:border-[#232f48] pb-2">
                                                Delete Account
                                            </h3>
                                            <div className="p-4 rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 flex items-center justify-between">
                                                <div className="text-sm">
                                                    <p className="font-bold text-red-700 dark:text-red-400">Warning: This action is permanent</p>
                                                    <p className="text-red-600/80 dark:text-red-400/80 mt-1">Once you delete your account, there is no going back. Please be certain.</p>
                                                </div>
                                                <button className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-bold text-sm px-4 py-2 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors">
                                                    Delete Account
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Privacy & Visibility */}
                            {activeTab === 'privacy' && (
                                <div className="space-y-6">
                                    <div className="flex flex-col gap-2">
                                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Privacy & Visibility</h2>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">Manage who can see your profile and activity.</p>
                                    </div>

                                    <section className="bg-transparent space-y-4">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-[#232f48] pb-2">
                                            Profile Visibility
                                        </h3>
                                        <div className="grid gap-3">
                                            {['everyone', 'connections', 'private'].map(opt => (
                                                <label key={opt} className={`flex items-center justify-between p-4 rounded-lg border ${visibility === opt ? 'border-primary bg-primary/5 dark:bg-primary/10' : 'border-slate-200 dark:border-[#232f48] bg-slate-50/50 dark:bg-[#111722]'} cursor-pointer hover:border-primary transition-all`}>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">{opt}</span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                            {opt === 'everyone' ? 'Visible to everyone on the network' : opt === 'connections' ? 'Only verified connections can see your profile' : 'Hidden from everyone except you'}
                                                        </span>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${visibility === opt ? 'border-primary' : 'border-slate-300 dark:border-slate-600'}`}>
                                                        {visibility === opt && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                                    </div>
                                                    <input
                                                        type="radio"
                                                        name="visibility"
                                                        checked={visibility === opt}
                                                        onChange={() => handleUpdateSetting('visibility', opt)}
                                                        className="hidden"
                                                    />
                                                </label>
                                            ))}
                                        </div>
                                    </section>

                                    <section className="bg-transparent space-y-4">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-[#232f48] pb-2">
                                            Activity Status
                                        </h3>
                                        <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-[#232f48] bg-slate-50/50 dark:bg-[#111722]">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">Show Active Status</span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Let others know when you're online</span>
                                            </div>
                                            <div
                                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${activeStatus ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                                                onClick={() => handleUpdateSetting('activeStatus', !activeStatus)}
                                            >
                                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${activeStatus ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-[#232f48] bg-slate-50/50 dark:bg-[#111722]">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">Read Receipts</span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">See when others have read your messages</span>
                                            </div>
                                            <div
                                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${readReceipts ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                                                onClick={() => handleUpdateSetting('readReceipts', !readReceipts)}
                                            >
                                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${readReceipts ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            )}

                            {/* Notifications */}
                            {activeTab === 'notifications' && (
                                <div className="space-y-6">
                                    <div className="flex flex-col gap-2">
                                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Notifications</h2>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">Choose how you want to be notified.</p>
                                    </div>

                                    <div className="p-4 rounded-lg border border-slate-200 dark:border-[#232f48] bg-slate-50/50 dark:bg-[#111722] space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">Push Notifications</span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Receive notifications on your device</span>
                                            </div>
                                            <div
                                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${pushNotifications ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                                                onClick={() => handleUpdateSetting('pushNotifications', !pushNotifications)}
                                            >
                                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${pushNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </div>
                                        </div>
                                        <div className="h-px bg-slate-200 dark:bg-[#232f48] w-full" />
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">Email Notifications</span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Receive updates via email</span>
                                            </div>
                                            <div
                                                className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${emailNotifications ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                                                onClick={() => handleUpdateSetting('emailNotifications', !emailNotifications)}
                                            >
                                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Blocked Accounts */}
                            {activeTab === 'blocked' && (
                                <div className="space-y-6">
                                    <div className="flex flex-col gap-2">
                                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Blocked Accounts</h2>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">Manage the people you have blocked.</p>
                                    </div>

                                    <div className="bg-white dark:bg-[#111722] border border-slate-200 dark:border-[#232f48] rounded-xl overflow-hidden">
                                        {blockedUsers.length > 0 ? (
                                            <div className="divide-y divide-slate-200 dark:divide-[#232f48]">
                                                {blockedUsers.map((blockedUser, index) => (
                                                    <div key={index} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-[#1e2736/50] transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-700 bg-cover bg-center border border-slate-200 dark:border-[#232f48]"
                                                                style={{ backgroundImage: `url(${blockedUser.avatar_url})` }}
                                                            />
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{blockedUser.full_name || blockedUser.email.split('@')[0]}</span>
                                                                <span className="text-xs text-slate-500">{blockedUser.email}</span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleUnblock(blockedUser.email)}
                                                            className="text-xs bg-slate-100 dark:bg-[#232f48] text-red-600 dark:text-red-400 border border-slate-200 dark:border-[#3b4c6b] hover:bg-red-50 dark:hover:bg-red-900/10 px-3 py-1.5 rounded-lg font-semibold transition-colors"
                                                        >
                                                            Unblock
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-12 text-center flex flex-col items-center">
                                                <div className="size-16 rounded-full bg-slate-100 dark:bg-[#232f48] flex items-center justify-center mb-4">
                                                    <span className="material-symbols-outlined text-3xl text-slate-400">check_circle</span>
                                                </div>
                                                <h3 className="text-slate-900 dark:text-white font-bold mb-1">No Blocked Accounts</h3>
                                                <p className="text-slate-500 dark:text-[#92a4c9] text-sm">You haven't blocked anyone yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default Settings;

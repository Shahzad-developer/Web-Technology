import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';

const ProfileSetup = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        bio: '',
        university: '',
        avatar: null,
        avatarPreview: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'user'}`
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                avatar: file,
                avatarPreview: URL.createObjectURL(file)
            }));
        }
    };

    const handleContinue = async () => {
        if (step === 1) {
            setLoading(true);
            try {
                // Update profile in Supabase
                const updates = {
                    full_name: `${formData.firstName} ${formData.lastName}`.trim(),
                    headline: formData.bio,
                    university: formData.university,
                    updated_at: new Date().toISOString(),
                };

                // Upload avatar if changed
                if (formData.avatar) {
                    const fileName = `${user.id}/${Date.now()}_avatar`;
                    const { error: uploadError } = await supabase.storage
                        .from('product-images') // Reusing existing bucket or create 'avatars'
                        .upload(fileName, formData.avatar);

                    if (!uploadError) {
                        const { data: { publicUrl } } = supabase.storage
                            .from('product-images')
                            .getPublicUrl(fileName);
                        updates.avatar_url = publicUrl;
                    }
                }

                const { error } = await supabase
                    .from('profiles')
                    .update(updates)
                    .eq('id', user.id);

                if (error) throw error;

                // Navigate to Feed for now (as only Step 1 is designed)
                navigate('/feed');
            } catch (error) {
                console.error('Error updating profile:', error);
            }
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#f6f6f8] dark:bg-[#101622] min-h-screen flex flex-col font-display text-slate-900 dark:text-white antialiased selection:bg-primary/30 selection:text-primary">
            {/* Top Navigation */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1C2535] px-6 py-4 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="size-8 text-primary">
                        <svg className="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_6_330)">
                                <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd" />
                            </g>
                            <defs>
                                <clipPath id="clip0_6_330"><rect height="48" width="48" /></clipPath>
                            </defs>
                        </svg>
                    </div>
                    <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-tight">ObrixChat</h2>
                </div>
                <div className="flex items-center gap-4">
                    <button className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">Help</button>
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <img
                            src={formData.avatarPreview}
                            alt="User Avatar"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
                {/* Wizard Card */}
                <div className="w-full max-w-2xl bg-white dark:bg-[#1C2535] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                    {/* Progress Section */}
                    <div className="bg-slate-50 dark:bg-[#161e2e] p-6 border-b border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-end">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Step 1 of 4</span>
                                    <p className="text-slate-900 dark:text-white text-lg font-bold">Personal Details</p>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Profile Strength: 25%</p>
                            </div>
                            <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                <div className="h-full rounded-full bg-primary transition-all duration-500 ease-out" style={{ width: '25%' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-6 md:p-10 flex flex-col gap-8">
                        {/* Headline */}
                        <div className="text-center space-y-2">
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Let's put a face to the name</h1>
                            <p className="text-slate-600 dark:text-slate-400">Upload a photo and fill in your details so your classmates recognize you.</p>
                        </div>

                        {/* Profile Photo Upload */}
                        <div className="flex justify-center">
                            <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload').click()}>
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 dark:border-[#232f48] shadow-lg relative bg-[#232f48]">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{ backgroundImage: `url('${formData.avatarPreview}')` }}
                                    />
                                    {/* Overlay on Hover */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white !text-3xl">photo_camera</span>
                                    </div>
                                </div>
                                <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 border-4 border-white dark:border-[#1C2535] shadow-sm flex items-center justify-center">
                                    <span className="material-symbols-outlined !text-lg">edit</span>
                                </div>
                                <input
                                    type="file"
                                    id="avatar-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        {/* Input Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-1 space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                                <div className="relative">
                                    <input
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg bg-slate-50 dark:bg-[#111722] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                        placeholder="e.g. Alex"
                                        type="text"
                                    />
                                </div>
                            </div>
                            <div className="col-span-1 md:col-span-1 space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                                <div className="relative">
                                    <input
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg bg-slate-50 dark:bg-[#111722] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                        placeholder="e.g. Morgan"
                                        type="text"
                                    />
                                </div>
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bio / Headline</label>
                                <div className="relative">
                                    <input
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg bg-slate-50 dark:bg-[#111722] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                        placeholder="Student at..."
                                        type="text"
                                    />
                                    <span className="absolute right-3 top-2.5 text-slate-400 dark:text-slate-500">
                                        <span className="material-symbols-outlined !text-xl">edit_note</span>
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-500">Briefly describe yourself or your goals.</p>
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-1.5">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">University / College</label>
                                <div className="relative group/input">
                                    <input
                                        name="university"
                                        value={formData.university}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg bg-slate-50 dark:bg-[#111722] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-2.5 pl-10 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                                        placeholder="Search for your university"
                                        type="text"
                                    />
                                    <span className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500 group-focus-within/input:text-primary transition-colors">
                                        <span className="material-symbols-outlined !text-xl">school</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="bg-slate-50 dark:bg-[#161e2e] p-6 border-t border-slate-200 dark:border-slate-800 flex flex-col-reverse md:flex-row justify-between items-center gap-4">
                        <button
                            onClick={() => navigate('/feed')}
                            className="text-slate-500 dark:text-slate-400 font-medium hover:text-slate-800 dark:hover:text-white transition-colors text-sm"
                        >
                            Skip for now
                        </button>
                        <div className="flex w-full md:w-auto gap-4">
                            <button
                                onClick={() => navigate('/feed')}
                                className="flex-1 md:flex-none px-6 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleContinue}
                                disabled={loading}
                                className="flex-1 md:flex-none px-8 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-blue-600 focus:ring-4 focus:ring-primary/20 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:opacity-70"
                            >
                                {loading ? 'Saving...' : 'Continue'}
                                {!loading && <span className="material-symbols-outlined !text-sm font-bold">arrow_forward</span>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Helper Text */}
                <p className="mt-6 text-slate-500 dark:text-slate-500 text-sm text-center">
                    Information you provide will be visible to other students in your network.
                </p>
            </main>
        </div>
    );
};

export default ProfileSetup;

import { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import FeedRightSidebar from '../components/FeedRightSidebar'; // Reusing default right sidebar

const Classes = () => {
    // Mock Data for Classes
    const [classes, setClasses] = useState([
        {
            id: 1,
            code: 'CS 320',
            name: 'Software Engineering',
            instructor: 'Dr. Emily Chen',
            schedule: 'Mon, Wed 10:00 AM - 11:30 AM',
            location: 'Building 4, Room 201',
            color: 'bg-blue-500',
            students: 45
        },
        {
            id: 2,
            code: 'MAT 202',
            name: 'Linear Algebra',
            instructor: 'Prof. Alan Turing',
            schedule: 'Tue, Thu 2:00 PM - 3:30 PM',
            location: 'Science Hall, Room 105',
            color: 'bg-purple-500',
            students: 60
        },
        {
            id: 3,
            code: 'PHY 101',
            name: 'Introduction to Physics',
            instructor: 'Dr. Sarah Newton',
            schedule: 'Fri 9:00 AM - 12:00 PM',
            location: 'Lab Complex 3',
            color: 'bg-green-500',
            students: 30
        }
    ]);

    return (
        <MainLayout rightSidebar={<FeedRightSidebar />}>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Classes</h1>
                    <button className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Join Class
                    </button>
                </div>

                {/* Info Alert */}
                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 p-4 rounded-xl flex items-start gap-3">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">info</span>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Fall 2024 Semester</h4>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                            Final exams schedule has been posted. Check your class details for more info.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                    {classes.map(cls => (
                        <div key={cls.id} className="bg-white dark:bg-[#1e2736] rounded-xl border border-slate-200 dark:border-[#232f48] overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                            <div className={`h-2 ${cls.color} w-full`} />
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 dark:bg-[#232f48] text-slate-600 dark:text-slate-300">
                                        {cls.code}
                                    </span>
                                    <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                        <span className="material-symbols-outlined">more_horiz</span>
                                    </button>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{cls.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-[#92a4c9] mb-4">{cls.instructor}</p>

                                <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-[#232f48] pt-4">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">schedule</span>
                                        {cls.schedule}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">location_on</span>
                                        {cls.location}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">group</span>
                                        {cls.students} Students
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center py-8">
                    <button className="text-primary hover:underline font-medium text-sm">View archived classes</button>
                </div>
            </div>
        </MainLayout>
    );
};

export default Classes;

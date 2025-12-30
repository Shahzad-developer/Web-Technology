import { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import FeedRightSidebar from '../components/FeedRightSidebar'; // Reusing default right sidebar

const Events = () => {
    const [events, setEvents] = useState([
        {
            id: 1,
            title: 'Tech Career Fair 2024',
            date: 'Oct 24, 2024',
            time: '10:00 AM - 4:00 PM',
            location: 'Main Auditorium',
            type: 'Career',
            image: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
            attendees: 120
        },
        {
            id: 2,
            title: 'Hackathon: Code for Good',
            date: 'Nov 05, 2024',
            time: '9:00 AM (48h)',
            location: 'Engineering Hall',
            type: 'Competition',
            image: 'https://images.unsplash.com/photo-1504384308090-c54be3855833?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
            attendees: 350
        },
        {
            id: 3,
            title: 'Guest Lecture: AI Ethics',
            date: 'Nov 12, 2024',
            time: '2:00 PM - 3:30 PM',
            location: 'Virtual (Zoom)',
            type: 'Lecture',
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
            attendees: 85
        }
    ]);

    const categories = ['All', 'Career', 'Social', 'Academic', 'Competition'];
    const [activeCategory, setActiveCategory] = useState('All');

    return (
        <MainLayout rightSidebar={<FeedRightSidebar />}>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Campus Events</h1>
                    <button className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Create Event
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeCategory === cat
                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                                    : 'bg-white dark:bg-[#1e2736] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#2d3b55] border border-slate-200 dark:border-[#232f48]'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                    {events.map(event => (
                        <div key={event.id} className="bg-white dark:bg-[#1e2736] rounded-xl border border-slate-200 dark:border-[#232f48] overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col sm:flex-row">
                            {/* Image */}
                            <div
                                className="w-full sm:w-48 h-48 sm:h-auto bg-cover bg-center shrink-0"
                                style={{ backgroundImage: `url(${event.image})` }}
                            />

                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold px-2 py-1 rounded bg-primary/10 text-primary uppercase tracking-wide">
                                        {event.type}
                                    </span>
                                    <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                                        <span className="material-symbols-outlined">share</span>
                                    </button>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">{event.title}</h3>

                                <div className="space-y-2 mt-auto">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
                                        <span>{event.date} • {event.time}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
                                        <span>{event.location}</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#232f48] flex items-center justify-between">
                                    <div className="flex items-center gap-[-8px]">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-[#1e2736] bg-gray-300" />
                                            ))}
                                        </div>
                                        <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">+{event.attendees} attending</span>
                                    </div>
                                    <button className="text-sm font-semibold text-slate-900 dark:text-white hover:underline">
                                        Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </MainLayout>
    );
};

export default Events;

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hplcvhutoctatcynvzot.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwbGN2aHV0b2N0YXRjeW52em90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NDY4MjksImV4cCI6MjA4MjQyMjgyOX0.vuGfIa_urcB6IQ9Hmb20gW8tVnEcPVxwXLsccrVJcO0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const USERS = [
    {
        email: 'sarah.miller@example.com',
        full_name: 'Sarah Miller',
        university: 'Parsons School of Design',
        headline: 'UI/UX Enthusiast & Illustrator',
        skills: ['Figma', '3D Modeling', 'Illustration', 'User Research'],
        about: 'Passionate about creating intuitive and beautiful user experiences. Currently working on a sustainable fashion app.',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
    },
    {
        email: 'david.chen@example.com',
        full_name: 'David Chen',
        university: 'UC Berkeley',
        headline: 'CS Major | Hackathon Junkie',
        skills: ['Python', 'React', 'Machine Learning', 'Node.js'],
        about: 'Building AI tools for students. Looking for teammates for the upcoming Global Hackathon!',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David'
    },
    {
        email: 'marcus.lee@example.com',
        full_name: 'Marcus Lee',
        university: 'Wharton School',
        headline: 'Aspiring Entrepreneur | Finance',
        skills: ['Finance', 'Marketing', 'Strategy', 'Public Speaking'],
        about: 'Founder of CampusEats. Always looking to connect with developers and designers.',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus'
    },
    {
        email: 'elena.rodriguez@example.com',
        full_name: 'Elena Rodriguez',
        university: 'Harvard University',
        headline: 'Biotech Researcher',
        skills: ['Biology', 'Lab Research', 'Data Analysis', 'Academic Writing'],
        about: 'Researching sustainable food sources. deeply interested in the intersection of biology and technology.',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena'
    },
    {
        email: 'james.wilson@example.com',
        full_name: 'James Wilson',
        university: 'MIT',
        headline: 'Robotics Engineer',
        skills: ['C++', 'ROS', 'Computer Vision', 'Embedded Systems'],
        about: 'Building autonomous drones. Love hiking and photography in my free time.',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James'
    },
    {
        email: 'aisha.patel@example.com',
        full_name: 'Aisha Patel',
        university: 'Stanford University',
        headline: 'AI Ethics Researcher',
        skills: ['Python', 'Ethics', 'Policy', 'Writing'],
        about: 'Advocating for responsible AI development.',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha'
    }
];

const POSTS = [
    {
        content: 'Just finished my final project for CS101! Check it out on GitHub. 🚀 #coding #cs #projects',
        author_email: 'david.chen@example.com',
        likes: 12,
        comments: 3
    },
    {
        content: 'Looking for a co-founder for a fintech startup. Ideally someone with a tech background. DM me if interested! 💼',
        author_email: 'marcus.lee@example.com',
        likes: 24,
        comments: 8
    },
    {
        content: 'The new campus library design is amazing! Great spot for studying. 📚✨',
        author_email: 'sarah.miller@example.com',
        likes: 45,
        comments: 5
    },
    {
        content: 'Anyone going to the AI summit this weekend? Let\'s meet up! 🤖',
        author_email: 'aisha.patel@example.com',
        likes: 18,
        comments: 2
    },
    {
        content: 'Working on a new drone prototype. The stability algorithms are tricky but getting there. 🚁',
        author_email: 'james.wilson@example.com',
        likes: 32,
        comments: 7
    }
];

async function seed() {
    console.log('🌱 Starting seed...');

    // 1. Upsert Profiles
    console.log('Creating profiles...');
    for (const user of USERS) {
        const { error } = await supabase
            .from('profiles')
            .upsert({
                email: user.email,
                full_name: user.full_name,
                headline: user.headline,
                university: user.university,
                about: user.about,
                avatar_url: user.avatar_url,
                skills: user.skills,
                is_public: true,
                updated_at: new Date().toISOString()
            }, { onConflict: 'email' });

        if (error) console.error(`Error creating ${user.full_name}:`, error.message);
    }

    // 2. Create Posts
    console.log('Creating posts...');
    for (const post of POSTS) {
        // Retrieve the user ID isn't strictly needed if we link by email,
        // but looking at postService, it inserts with email.
        // Let's check if the posts already exist to avoid duplicates if run multiple times.
        // We'll just insert new ones for now, or maybe check content.

        const { error } = await supabase
            .from('posts')
            .insert({
                user_email: post.author_email,
                content: post.content,
                likes: post.likes, // Assuming likes column is integer count, or we need to create like rows. 
                // If schema has 'likes' array or count, we adapt. 
                // Checking schema: likely a related table 'post_likes' is better, 
                // but let's see if postService handles a count. 
                // Actually, usually likes are dynamic. I'll just insert the post.
                created_at: new Date().toISOString()
            });

        if (error) console.error('Error creating post:', error.message);
    }

    // 3. Create Connections (Randomly connect some users)
    console.log('Creating connections...');
    const emails = USERS.map(u => u.email);
    for (let i = 0; i < emails.length - 1; i++) {
        const { error } = await supabase
            .from('connections')
            .insert({
                requester_email: emails[i],
                addressee_email: emails[i + 1],
                status: 'accepted'
            });
        if (error && !error.message.includes('duplicate')) console.error('Error creating connection:', error.message);
    }

    console.log('✅ Seed complete!');
}

seed().catch(console.error);

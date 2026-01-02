export default function socketLogic(io) {
    const users = new Map(); // email -> socketId
    const onlineUsers = new Set(); // Set of online emails
    const roomsParticipants = new Map(); // roomId -> Set of socketIds

    // Broadcast online users list to all connected clients
    const broadcastOnlineUsers = () => {
        io.emit('online_users_update', Array.from(onlineUsers));
    };

    // Check if a user is online
    const isUserOnline = (email) => onlineUsers.has(email);

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('identify', (email) => {
            users.set(email, socket.id);
            socket.userEmail = email;
            socket.join(email);
            onlineUsers.add(email);
            console.log(`User ${email} identified and online`);

            broadcastOnlineUsers();
            socket.emit('online_users_update', Array.from(onlineUsers));
        });

        // --- Notifications ---
        socket.on('send_notification', (notif) => {
            console.log('🔔 Notification received on server for:', notif.user_email);
            io.to(notif.user_email).emit('new_notification', notif);
        });

        // --- Private Messaging ---
        socket.on('join_chat', (chatId) => {
            socket.join(`chat_${chatId}`);
        });

        socket.on('send_message', (message) => {
            console.log('📨 Message received on server:', message.id, 'type:', message.message_type);

            // Broadcast message to chat room
            io.to(`chat_${message.chat_id}`).emit('receive_message', message);

            // CRITICAL: Only send delivery confirmation if receiver is ACTUALLY online
            const receiverEmail = message.receiver_email;
            const senderEmail = message.sender_email;

            if (receiverEmail && isUserOnline(receiverEmail)) {
                console.log('✅ Receiver is online, sending delivery confirmation');
                // Send delivery status update to sender
                io.to(senderEmail).emit('message_status_update', {
                    message_id: message.id,
                    chat_id: message.chat_id,
                    status: 'delivered'
                });
            } else {
                console.log('❌ Receiver is OFFLINE, no delivery confirmation');
            }
        });

        // --- Typing Indicator ---
        socket.on('typing', (data) => {
            io.to(`chat_${data.chat_id}`).emit('user_typing', data);
        });

        // --- Read Receipts ---
        socket.on('messages_read', ({ chat_id, reader_email, message_ids }) => {
            console.log('📖 Messages read by:', reader_email, 'ids:', message_ids);

            // Broadcast read status to all in chat
            io.to(`chat_${chat_id}`).emit('messages_marked_read', {
                chat_id,
                reader_email,
                message_ids: message_ids || []
            });
        });

        // --- Private Room Invitations ---
        socket.on('send-invite', (invite) => {
            io.to(invite.invitee_email).emit('new-invite', invite);
        });

        // --- Private Room/Study Room Logic ---
        socket.on('join-room', async ({ roomId, userEmail, userName, userAvatar }) => {
            socket.join(roomId);
            if (!roomsParticipants.has(roomId)) {
                roomsParticipants.set(roomId, new Set());
            }
            roomsParticipants.get(roomId).add(socket.id);

            socket.to(roomId).emit('user-joined', {
                socketId: socket.id,
                userEmail,
                userName,
                userAvatar
            });

            const participants = Array.from(roomsParticipants.get(roomId))
                .filter(id => id !== socket.id);
            socket.emit('current-participants', participants);
        });

        socket.on('kick-participant', ({ roomId, targetEmail }) => {
            io.to(targetEmail).emit('kicked-from-room', { roomId });
        });

        socket.on('leave-room', (roomId) => {
            socket.leave(roomId);
            if (roomsParticipants.has(roomId)) {
                roomsParticipants.get(roomId).delete(socket.id);
                socket.to(roomId).emit('user-left', socket.id);
            }
        });

        // --- 1-on-1 Calling ---
        socket.on('call-user', (data) => {
            console.log(`Call from ${data.from} to ${data.to}`);
            io.to(data.to).emit('incoming-call', data);
        });

        socket.on('reject-call', (data) => {
            io.to(data.to).emit('call-rejected', { from: data.from });
        });

        // --- Signaling ---
        socket.on('webrtc-signal', ({ to, from, signal, type }) => {
            io.to(to).emit('webrtc-signal', { from: socket.id, fromEmail: from, signal, type });
        });

        // --- Disconnect ---
        socket.on('disconnect', () => {
            const email = socket.userEmail;
            if (email) {
                users.delete(email);
                onlineUsers.delete(email);
                console.log(`User ${email} disconnected`);
                broadcastOnlineUsers();
            }

            roomsParticipants.forEach((participants, roomId) => {
                if (participants.has(socket.id)) {
                    participants.delete(socket.id);
                    socket.to(roomId).emit('user-left', socket.id);
                }
            });
        });
    });
}

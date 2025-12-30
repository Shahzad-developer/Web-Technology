import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Chat from './pages/Chat';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Connections from './pages/Connections';
import Notifications from './pages/Notifications';
import Search from './pages/Search';
import Landing from './pages/Landing';
import ProfileSetup from './pages/ProfileSetup';
import Settings from './pages/Settings';
import Bookmarks from './pages/Bookmarks';
import Classes from './pages/Classes';
import Events from './pages/Events';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background-dark">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return user ? children : <Navigate to="/landing" />;
};

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background-dark">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return user ? <Navigate to="/feed" /> : children;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/landing" element={<PublicRoute><Landing /></PublicRoute>} />
                    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

                    {/* Social Routes */}
                    <Route
                        path="/feed"
                        element={
                            <PrivateRoute>
                                <Feed />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute>
                                <Profile />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/profile/:email"
                        element={
                            <PrivateRoute>
                                <Profile />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/connections"
                        element={
                            <PrivateRoute>
                                <Connections />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/profile-setup"
                        element={
                            <PrivateRoute>
                                <ProfileSetup />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/notifications"
                        element={
                            <PrivateRoute>
                                <Notifications />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/search"
                        element={
                            <PrivateRoute>
                                <Search />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/bookmarks"
                        element={
                            <PrivateRoute>
                                <Bookmarks />
                            </PrivateRoute>
                        }
                    />

                    {/* Chat Route */}
                    <Route
                        path="/chat"
                        element={
                            <PrivateRoute>
                                <Chat />
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/settings"
                        element={
                            <PrivateRoute>
                                <Settings />
                            </PrivateRoute>
                        }
                    />

                    {/* Default to Feed for authenticated, Landing for guests */}
                    <Route
                        path="/classes"
                        element={
                            <PrivateRoute>
                                <Classes />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/events"
                        element={
                            <PrivateRoute>
                                <Events />
                            </PrivateRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to="/feed" />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;

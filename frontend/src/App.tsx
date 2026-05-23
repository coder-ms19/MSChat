import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, type JSX, type ReactNode } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import ChatPage from './pages/ChatPage';
import ConversationsPage from './pages/ConversationsPage';
import ChatConversationPage from './pages/ChatConversationPage';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import PostsPage from './pages/PostsPage';
import AuthCallback from './pages/AuthCallback';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import { CallProvider } from './contexts/CallContext';
import { RandomCallProvider } from './contexts/RandomCallContext';
import { IncomingCallModal } from './components/IncomingCallModal';
import { OngoingCallUI } from './components/OngoingCallUI';
import { ActiveCallIndicator } from './components/ActiveCallIndicator';
import RandomVideoPage from './pages/RandomVideoPage';

// ProtectedRoute must be defined OUTSIDE App to maintain a stable component identity.
// If defined inside App, React recreates it on every render, causing unmount/remount
// cycles that briefly evaluate `user` as null and redirect to /login.
function ProtectedRoute({ user, isLoading, children }: { user: any; isLoading: boolean; children: ReactNode }) {
  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#050508] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white/60 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    } else {
      setUser(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkUser();
    window.addEventListener('auth-change', checkUser);
    return () => window.removeEventListener('auth-change', checkUser);
  }, []);



  const content = (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user} isLoading={isLoading}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute user={user} isLoading={isLoading}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/posts"
          element={
            <ProtectedRoute user={user} isLoading={isLoading}>
              <PostsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/conversations"
          element={
            <ProtectedRoute user={user} isLoading={isLoading}>
              <ConversationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:conversationId"
          element={
            <ProtectedRoute user={user} isLoading={isLoading}>
              <ChatConversationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute user={user} isLoading={isLoading}>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/random-chat"
          element={
            <ProtectedRoute user={user} isLoading={isLoading}>
              <RandomVideoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute user={user} isLoading={isLoading}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />


        {/* 404 Not Found - catch all routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Global Call UI Components */}
      {user && (
        <>
          <IncomingCallModal />
          <OngoingCallUI />
          <ActiveCallIndicator />
        </>
      )}
    </>
  );

  if (isLoading) {
    return <div className="h-screen w-screen bg-[#050508]" />;
  }

  // Wrap with CallProvider and RandomCallProvider only if user is logged in
  if (user) {
    return (
      <CallProvider userId={user.id} username={user.username}>
        <RandomCallProvider>
          {content}
        </RandomCallProvider>
      </CallProvider>
    );
  }

  return content;
}

export default App;


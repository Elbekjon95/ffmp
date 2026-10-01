import React, { useState } from 'react';
import { FamilyProvider } from './context/FamilyContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { FamilyCanvas } from './components/Canvas/FamilyCanvas';
import { MemberDetailDrawer } from './components/Modals/MemberDetailDrawer';
import { MemberModal } from './components/Modals/MemberModal';
import { StatsModal } from './components/Modals/StatsModal';
import { MarriageModal } from './components/Modals/MarriageModal';
import { EditSidebar } from './components/Sidebar/EditSidebar';
import { LoginPage } from './components/Auth/LoginPage';
import { FeedbackModal } from './components/Feedback/FeedbackModal';
import { AdminPanel } from './components/Admin/AdminPanel';

function FamilyApp() {
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div className="app-container">
      <Navbar
        onOpenFeedback={() => setShowFeedback(true)}
        onOpenAdmin={() => setShowAdmin(true)}
      />
      <FamilyCanvas />
      <EditSidebar />
      <MemberDetailDrawer />
      <MemberModal />
      <StatsModal />
      <MarriageModal />
      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </div>
  );
}

function AuthGate() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading-spinner" />
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <FamilyProvider>
      <FamilyApp />
    </FamilyProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}


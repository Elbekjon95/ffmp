import React from 'react';
import { FamilyProvider } from './context/FamilyContext';
import { Navbar } from './components/Navbar';
import { FamilyCanvas } from './components/Canvas/FamilyCanvas';
import { MemberDetailDrawer } from './components/Modals/MemberDetailDrawer';
import { MemberModal } from './components/Modals/MemberModal';
import { StatsModal } from './components/Modals/StatsModal';
import { MarriageModal } from './components/Modals/MarriageModal';
import { EditSidebar } from './components/Sidebar/EditSidebar';

function FamilyApp() {
  return (
    <div className="app-container">
      <Navbar />
      <FamilyCanvas />
      <EditSidebar />
      <MemberDetailDrawer />
      <MemberModal />
      <StatsModal />
      <MarriageModal />
    </div>
  );
}

export default function App() {
  return (
    <FamilyProvider>
      <FamilyApp />
    </FamilyProvider>
  );
}

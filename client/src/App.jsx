import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Hero from './components/Hero';
import NewsSection from './components/NewsSection';
import EventsSection from './components/EventsSection';
import QuickLinks from './components/QuickLinks';
import PartyHistory from './components/PartyHistory';
import LeaderProfile from './components/LeaderProfile';
import Manifesto from './components/Manifesto';
import NewsUpdates from './components/NewsUpdates';
import NewsDetail from './components/NewsDetail';
import DocDetail from './components/DocDetail';
import Gallery from './components/Gallery';
import Donation from './components/Donation';
import Contact from './components/Contact';
import Login from './pages/Login';
import Admin from './pages/Admin';
import AdminDashboard from './pages/AdminDashboard';
import Join from './pages/Join';
import Footer from './components/Footer';
import { initAdminEventHandler } from './utils/adminEventHandler';

const Home = () => (
  <>
    <Hero />
    <NewsSection />
    <EventsSection />
    <QuickLinks />
    <Footer />
  </>
);
function AppContent() {
  const location = useLocation();
  const hideFooter = location.pathname === '/login' || location.pathname === '/admin';

  return (
    <div className="min-h-screen bg-light font-inter">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<PartyHistory />} />
          <Route path="/leader" element={<LeaderProfile />} />
          <Route path="/manifesto" element={<Manifesto />} />
          <Route path="/news" element={<NewsUpdates />} />
          <Route path="/news/:index" element={<NewsDetail />} />
          <Route path="/docs/:docId" element={<DocDetail />} />
          <Route path="/speeches" element={<DocDetail presetKey={'speeches'} />} />
          <Route path="/stats" element={<DocDetail presetKey={'stats'} />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/donate" element={<Donation />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/join" element={<Join />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </main>
      {/* footer removed project-wide as requested */}
    </div>
  );
}

function App() {
  initAdminEventHandler();
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;
 

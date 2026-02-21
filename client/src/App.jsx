import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Hero from './components/Hero';
import NewsSection from './components/NewsSection';
import EventsSection from './components/EventsSection';
import QuickLinks from './components/QuickLinks';
import Footer from './components/Footer';
import PartyHistory from './components/PartyHistory';
import LeaderProfile from './components/LeaderProfile';
import Manifesto from './components/Manifesto';
import NewsUpdates from './components/NewsUpdates';
import Gallery from './components/Gallery';
import Donation from './components/Donation';
import Contact from './components/Contact';

const Home = () => (
  <>
    <Hero />
    <NewsSection />
    <EventsSection />
    <QuickLinks />
  </>
);

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-light font-inter">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/history" element={<PartyHistory />} />
            <Route path="/leader" element={<LeaderProfile />} />
            <Route path="/manifesto" element={<Manifesto />} />
            <Route path="/news" element={<NewsUpdates />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/donate" element={<Donation />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

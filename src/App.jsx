import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import MobileBottomNav from './components/MobileBottomNav.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import Home from './pages/Home.jsx';
import Browse from './pages/Browse.jsx';
import Track from './pages/Track.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Checkout from './pages/Checkout.jsx';
import Confirmation from './pages/Confirmation.jsx';
import Feedback from './pages/Feedback.jsx';
import Bulk from './pages/Bulk.jsx';
import PurchaseHistory from './pages/PurchaseHistory.jsx';
import Verify from './pages/Verify.jsx';
import Policy from './pages/Policy.jsx';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1 pt-16 md:pt-20 pb-20 md:pb-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/bulk" element={<Bulk />} />
          <Route path="/track" element={<Track />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/purchase-history" element={<PurchaseHistory />} />
          <Route path="/verify/:qrcode" element={<Verify />} />
          <Route path="/policy/:slug" element={<Policy />} />
        </Routes>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

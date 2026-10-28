import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Analyze } from './pages/Analyze';
import { History } from './pages/History';
import { Learn } from './pages/Learn';
import { About } from './pages/About';

export function App() {
  // Enforce dark mode as permanent default
  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('trustlens_theme', 'dark');
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#07090E] text-slate-100 selection:bg-lens-500 selection:text-white">
        <Navbar />
        
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analyze" element={<Analyze />} />
            <Route path="/history" element={<History />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;

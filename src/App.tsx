import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Weather from "./pages/Weather";
import Favorites from "./pages/Favorites";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

/**
 * Hauptkomponente der App.
 * Enthaelt das Routing, die Navigation und den Footer.
 * Alle Seiten werden ueber React Router als SPA gerendert.
 */
function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <main className="main-content" id="main-content" role="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/wetter" element={<Weather />} />
            <Route path="/favoriten" element={<Favorites />} />
            <Route path="/ueber-uns" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;

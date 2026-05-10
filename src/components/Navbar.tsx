import { NavLink } from "react-router-dom";
import { Home, CloudSun, Star, Info, Menu, X } from "lucide-react";
import { useState } from "react";
import UnitToggle from "./UnitToggle";

/**
 * Navbar-Komponente mit responsiver Navigation.
 * Enthaelt Links zu allen Seiten und den Einheiten-Umschalter.
 */
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar" role="navigation" aria-label="Hauptnavigation">
      <div className="navbar-container">
        <NavLink to="/" className="navbar-brand" onClick={closeMenu}>
          <CloudSun size={28} aria-hidden="true" />
          <span>WeatherWise</span>
        </NavLink>

        <button
          className="navbar-toggle"
          onClick={toggleMenu}
          aria-label={menuOpen ? "Menu schliessen" : "Menu oeffnen"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`navbar-menu ${menuOpen ? "open" : ""}`}>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeMenu}
            end
          >
            <Home size={18} aria-hidden="true" />
            <span>Startseite</span>
          </NavLink>

          <NavLink
            to="/wetter"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeMenu}
          >
            <CloudSun size={18} aria-hidden="true" />
            <span>Wetter</span>
          </NavLink>

          <NavLink
            to="/favoriten"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeMenu}
          >
            <Star size={18} aria-hidden="true" />
            <span>Favoriten</span>
          </NavLink>

          <NavLink
            to="/ueber-uns"
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeMenu}
          >
            <Info size={18} aria-hidden="true" />
            <span>Info</span>
          </NavLink>

          <div className="nav-unit-toggle">
            <UnitToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

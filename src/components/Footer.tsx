import { Github, CloudSun } from "lucide-react";

/**
 * Footer-Komponente mit Projektinformationen und Links.
 */
function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-brand">
          <CloudSun size={20} aria-hidden="true" />
          <span>WeatherWise</span>
        </div>
        <p className="footer-text">
          Wetterdaten von{" "}
          <a
            href="https://openweathermap.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            OpenWeatherMap
          </a>
        </p>
        <div className="footer-links">
          <a
            href="https://git.gibb.ch/osa153090/weatherwise-web-wetter-app"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitLab Repository"
          >
            <Github size={18} />
            <span>GitLab</span>
          </a>
        </div>
        <p className="footer-copyright">
          &copy; {new Date().getFullYear()} WeatherWise &ndash; GIBB Bern, WEB2 Projekt
        </p>
      </div>
    </footer>
  );
}

export default Footer;

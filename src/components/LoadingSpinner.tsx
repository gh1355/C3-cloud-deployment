import { Loader } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
}

/**
 * LoadingSpinner-Komponente zeigt einen Ladezustand an.
 * Wiederverwendbar in allen Bereichen der App.
 */
function LoadingSpinner({ message = "Daten werden geladen..." }: LoadingSpinnerProps) {
  return (
    <div className="loading-spinner" role="status" aria-live="polite">
      <Loader size={36} className="spinner-icon" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}

export default LoadingSpinner;

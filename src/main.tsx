
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  if (import.meta.env.DEV) {
    import('./app/services/setupAdmin').then(m => {
      (window as unknown as Record<string, unknown>).setupAdmin = m.setupAdmin;
    });
  }

  createRoot(document.getElementById("root")!).render(<App />);
  
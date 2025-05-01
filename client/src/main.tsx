import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set title programmatically
document.title = "ProxyWave - Secure Web Proxy Service";

createRoot(document.getElementById("root")!).render(<App />);

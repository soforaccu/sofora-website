import { ConvexProvider, ConvexReactClient } from "convex/react";
import { LiveWebsite } from "./data/LiveWebsite";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { App } from "./App";
import { AskSofora } from "./components/AskSofora";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexProvider client={new ConvexReactClient(import.meta.env.VITE_CONVEX_URL)}><LiveWebsite><BrowserRouter>
      <App />
      <AskSofora />
    </BrowserRouter></LiveWebsite></ConvexProvider>
  </StrictMode>,
);

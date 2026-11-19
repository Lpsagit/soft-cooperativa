import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { CooperativaApp } from "./CooperativaApp";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CooperativaApp />
  </StrictMode>,
);

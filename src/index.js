import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import "katex/dist/katex.min.css";

import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
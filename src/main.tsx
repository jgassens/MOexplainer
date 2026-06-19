import React from "react";
import ReactDOM from "react-dom/client";
import "katex/dist/katex.min.css";
import "./styles/global.css";
import "./styles/guided-lessons.css";
import "./styles/phase-lesson.css";
import { AppShell } from "./components/AppShell/AppShell";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppShell />
  </React.StrictMode>,
);

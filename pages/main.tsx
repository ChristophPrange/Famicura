// Statische Demo für GitHub Pages: nur die Oberfläche, ohne Server, D1 und R2.
// /api/* gibt es hier nicht, die App bietet deshalb nur die fiktive Beispielfamilie an.
import { createRoot } from "react-dom/client";
import Novalis from "../app/novalis";
import "../app/globals.css";

createRoot(document.getElementById("root")!).render(<Novalis />);

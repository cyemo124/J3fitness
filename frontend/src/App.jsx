import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ScrollToTop from "./components/ScrollToTop";

import AnimatedRoutes from "./components/AnimatedRoutes";

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <AnimatedRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;

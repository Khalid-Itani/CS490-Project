import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import ProfileForm from "./components/ProfileForm";
import ProfileSummary from "./components/ProfileSummary";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<ProfileForm />} />
          <Route path="/summary" element={<ProfileSummary />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


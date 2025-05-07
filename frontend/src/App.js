import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import StudentHome from "./components/StudentHome";
import ThesisView from "./components/ThesisView";
import ProfileEditor from "./components/ProfileEditor";
import GramateiaHome from "./components/GramateiaHome"; //Αρχική σελίδα γραμματείας
import GramateiaView from "./components/GramateiaView"; //Κουμπί προβολής διπλωματικών


const DiplomaManager = () => <h2>Διαχείριση Διπλωματικής</h2>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/student" element={<StudentHome />} />
        <Route path="/thesis" element={<ThesisView />} />
        <Route path="/profile" element={<ProfileEditor />} />
        <Route path="/diploma" element={<DiplomaManager />} />
        <Route path="/secretary" element={<GramateiaHome />} /> 
        <Route path="/diplomas" element={<GramateiaView />} /> {/* Κουμπί προβολής διπλωματικών */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;


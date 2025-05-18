import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import StudentHome from "./components/StudentHome";
import ThesisView from "./components/ThesisView";
import ProfileEditor from "./components/ProfileEditor";

import GramateiaHome from "./components/GramateiaHome"; //Αρχική σελίδα γραμματείας
import GramateiaView from "./components/GramateiaView"; //Κουμπί προβολής διπλωματικών
import GramateiaInsert from "./components/GramateiaInsert"; //Κουμπί εισαγωγής προσωπικών δεδομένων καθηγητών και φοιτητών

import DiplomaManager from "./components/DiplomaManager";
import ExetasiPhase from "./components/ExetasiPhase";
import FinishedPhase from "./components/FinishedPhase";
import PraktikoView from "./components/PraktikoView";




function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/student" element={<StudentHome />} />
        <Route path="/thesis" element={<ThesisView />} />
        <Route path="/profile" element={<ProfileEditor />} />
        <Route path="/diploma" element={<DiplomaManager />} />
        <Route path="/praktiko" element={<PraktikoView />} />

        <Route path="/secretary" element={<GramateiaHome />} /> 
        <Route path="/diplomas" element={<GramateiaView />} /> {/* Κουμπί προβολής διπλωματικών */}
        <Route path="/data-entry" element={<GramateiaInsert />} /> {/* Κουμπί εισαγωγής προσωπικών δεδομένων καθηγητών και φοιτητών */}

        


      </Routes>
    </BrowserRouter>
  );
}

export default App;


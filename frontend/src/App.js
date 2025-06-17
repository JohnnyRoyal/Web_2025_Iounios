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

import TeacherHome from "./components/TeacherHome";
import CreateThema from "./components/CreateThema";
import ThemataView from "./components/ThemataView";
import TeacherInvites from "./components/TeacherInvites";
import AssignThema from "./components/AssignThema";
import AnaklisiThematos from "./components/AnaklisiThematos";
import TeacherDiplomas from "./components/TeacherDiplomas";
import TeacherDiplomaDetails from "./components/TeacherDiplomaDetails";
import TeacherStatistics from "./components/TeacherStatistics";
import ViewProskliseis from "./components/ViewProskliseis";
import TeacherManageDiplomaYpoAnathesi from "./components/TeacherManageDiplomaYpoAnathesi";
import TeacherManageDiplomaEnergi from "./components/TeacherManageDiplomaEnergi"; // Διαχείριση διπλωματικής από τον διδάσκοντα για ενεργές διπλωματικές

// Το App.js είναι το κύριο αρχείο της εφαρμογής που περιέχει τις διαδρομές (routes) για κάθε σελίδα της εφαρμογής.
// Χρησιμοποιεί το React Router για να καθορίσει ποιο συστατικό θα εμφανίζεται ανάλογα με τη διαδρομή URL.

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

        <Route path="/teacher" element={<TeacherHome />} />
        <Route path="/teacher/CreateThema" element={<CreateThema />} />
        <Route path="/teacher/themata" element={<ThemataView />} />
        <Route path="/teacher/invites" element={<TeacherInvites />} />
        <Route path="/assign-thema" element={<AssignThema />} />
        <Route path="/AnaklisiThematos" element={<AnaklisiThematos />} />
        <Route path="/ProfessorDiplomas" element={<TeacherDiplomas />} />
        <Route path="/diploma/:id" element={<TeacherDiplomaDetails />} />
        <Route path="/TeacherStatistics" element={<TeacherStatistics/>} />
        <Route path="/teacher-manage-diploma-ypo-anathesi/:id" element={<TeacherManageDiplomaYpoAnathesi />} />
        <Route path="/view-proskliseis/:id" element={<ViewProskliseis />} /> {/* Το /:id στο τέλος γίνεται για να αλλάζει η σελίδα δυναμικά ανάλογα το id της διπλωματικής και να μεταφέρεται, για να πειράζουμε στην σελίδα μόνο την διπλωματική αυτή*/}
        <Route path="/teacher-manage-diploma-energi/:id" element={<TeacherManageDiplomaEnergi />} /> {/* Διαχείριση διπλωματικής από τον διδάσκοντα για ενεργές διπλωματικές */}






      </Routes>
    </BrowserRouter>
  );
}

export default App;


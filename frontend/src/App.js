import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import StudentHome from "./components/StudentHome";
import ThesisView from "./components/ThesisView";

const ProfileEditor = () => <h2>Επεξεργασία Προφίλ</h2>;
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;


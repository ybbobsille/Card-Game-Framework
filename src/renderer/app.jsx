import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Select_Game from "./pages/Select_Game";
import Edit_Game from "./pages/Edit_Game"; 

export default function App() {
    return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/edit/Test2" />} />
        <Route path="/select" element={<Select_Game />} />
        <Route path="/edit/:id" element={<Edit_Game />} />
      </Routes>
    </BrowserRouter>
    );
}

import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "../login/Login";
import YorkieTldrawEditor from "../mutliplayer/YorkieTldrawEditor";

export default function Router() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/editor-v0.3" element={<YorkieTldrawEditor />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

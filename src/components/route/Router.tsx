import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "../login/Login";
import YorkieTldrawEditor from "../mutliplayer/YorkieTldrawEditor";
import YorkieTldrawEditorAsset from "../mutliplayer/YorkieTldrawEditorAsset";

const VERSION: string = "v0.6";

export default function Router() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path={`/editor-${VERSION}`} element={<YorkieTldrawEditor />} />
          {/* Use this route if asset storage is availiable 
          <Route path={`/editor-${VERSION}`} element={<YorkieTldrawEditorAsset />} />
          */}
        </Routes>
      </BrowserRouter>
    </>
  );
}

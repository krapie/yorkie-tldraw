import { Tldraw, useFileSystem } from "@krapi0314/tldraw";
import { useMultiplayerState } from "./mutliplayer/useMultiplayerState";
import "./styles.css";

const VERSION = 1;
const roomID = `yorkie-tldraw-${VERSION}`;

/*
This demo shows how to integrate TLDraw with a multiplayer room
via Yorkie. You could use any other service instead—the important
part is to get data from the Tldraw app when its document changes 
and update it when the server's synchronized document changes.

Warning: Keeping images enabled for multiplayer applications
without providing a storage bucket based solution will cause
massive base64 string to be written to the multiplayer storage.
It's recommended to use a storage bucket based solution, such as
Amazon AWS S3. Further demo will be implemented.
*/
function YorkieTldrawEditor({ roomId }: { roomId: string }) {
  const fileSystemEvents = useFileSystem();
  const { ...events } = useMultiplayerState(roomId);

  return (
    <div>
      <Tldraw
        autofocus
        disableAssets
        showPages={false}
        {...fileSystemEvents}
        {...events}
      />
    </div>
  );
}

export default function App() {
  return (
    <div className="tldraw">
      <YorkieTldrawEditor roomId={roomID} />
    </div>
  );
}

import { Tldraw, useFileSystem } from "@tldraw/tldraw";
import { useMultiplayerAssets } from "./hooks/useMultiplayerAssets";
import { useMultiplayerState } from "./hooks/useMultiplayerState";

/*
This demo shows how to integrate TLDraw with a multiplayer room
via Yorkie. You could use any other service instead—the important
part is to get data from the Tldraw app when its document changes 
and update it when the server's synchronized document changes.
*/
function Editor({ roomId, userName }: { roomId: string; userName: string }) {
  const fileSystemEvents = useFileSystem();
  const { ...events } = useMultiplayerState(roomId, userName);
  const { ...assetEvents } = useMultiplayerAssets();

  return (
    <div>
      <Tldraw
        autofocus
        disableAssets={false}
        showPages={false}
        {...assetEvents}
        {...fileSystemEvents}
        {...events}
      />
    </div>
  );
}

export default function YorkieTldrawEditorAsset() {
  return (
    <div className="tldraw">
      <Editor
        roomId={
          sessionStorage.getItem("room") === null
            ? "room1"
            : (sessionStorage.getItem("room") as string)
        }
        userName={
          sessionStorage.getItem("userName") === null
            ? "Anonymous"
            : (sessionStorage.getItem("userName") as string)
        }
      />
    </div>
  );
}

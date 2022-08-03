import { TDBinding, TDShape, TDUser, TldrawApp } from '@tldraw/tldraw'
import { useCallback, useEffect, useState } from 'react'
import * as yorkie from 'yorkie-js-sdk'

/** Client **/
// Creating a client
let client: yorkie.Client<yorkie.Indexable>

/** Document **/
// Creating a document
let doc: yorkie.Document<yorkie.Indexable>

/** Doc Type */
export type YorkieType = {
  shapes: Record<string, TDShape>
  bindings: Record<string, TDBinding>
}

export function useMultiplayerState(roomId: string) {
  const [app, setApp] = useState<TldrawApp>()
  const [loading, setLoading] = useState(true)

  const onMount = useCallback(
    (app: TldrawApp) => {
      app.loadRoom(roomId)
      app.pause()
      setApp(app)
    },
    [roomId]
  )

  const onChangePage = useCallback(
    (
      app: TldrawApp,
      shapes: Record<string, TDShape | undefined>,
      bindings: Record<string, TDBinding | undefined>
    ) => {
      if (loading) return
      //undoManager.stopCapturing();
      
      doc.update((root) => {
        Object.entries(shapes).forEach(([id, shape]) => {
          if (!shape) {
            delete root.shapes[id]
          } else {
            root.shapes[id] = shape
          }
        })
        Object.entries(bindings).forEach(([id, binding]) => {
          if (!binding) {
            delete root.bindings[id]
          } else {
            root.bindings[id] = binding
          }
        })
      })
    },
    [loading]
  )

  const onUndo = useCallback(() => {
    //undoManager.undo();
  }, [])

  const onRedo = useCallback(() => {
    //undoManager.redo();
  }, [])

  /**
   * Callback to update user's (self) presence
   */
  const onChangePresence = useCallback((app: TldrawApp, user: TDUser) => {
    if (loading) return

    // need to limit rate of callback invocation
    // setting rate limit by prime numbers
    const time = new Date().getTime()
    if(time % 19 !== 0) return
    
    client.updatePresence("user", user);
  }, [loading])

  useEffect(() => {
    if (!app) return

    function handleChanges() {
      let root = doc.getRoot()

      let shapeRecord: Record<string, TDShape> = JSON.parse(JSON.parse(JSON.stringify(root.shapes)))
      let bindingRecord: Record<string, TDBinding> = JSON.parse(JSON.parse(JSON.stringify(root.bindings)))
      app?.replacePageContent(shapeRecord, bindingRecord, {})
    }

    async function setup() {
      try {
        // active yorkie client
        // with presence
        const options = {
          presence: {
            user: app?.currentUser,
          },
        };
        client = new yorkie.Client(
          'http://wbj-vpc-alb-private-152462774.ap-northeast-2.elb.amazonaws.com:8090', options
        )
        await client.activate()

        client.subscribe((event) => {
          if (event.type === 'peers-changed') {
            const peers = event.value[doc.getKey()];

            let users: TDUser[] = [];
            for (const [clientID, presence] of Object.entries(peers)) {
             users.push(presence.user)
            }
            
            // remove all users
            Object.values(app!.room!.users).forEach((user) => {
              app?.removeUser(user.id);
            });
            
            // update users
            app?.updateUsers(
              users
            )
          }
        })

        // attach yorkie document to client
        doc = new yorkie.Document<YorkieType>('demo')
        await client.attach(doc)

        doc.update((root) => {
          if (!root.shapes) {
            root.shapes = {}
          }
          if (!root.bindings) {
            root.bindings = {}
          }
        }, 'create shapes/bindings object if not exists')

        doc.subscribe((event) => {
          handleChanges()
        })

        await client.sync()

        handleChanges()
        setLoading(false)
      } catch (e) {
        console.error(e)
      }
    }

    setup()

    return () => {
    }
  }, [app])

  return {
    onMount,
    onChangePage,
    onUndo,
    onRedo,
    loading,
    onChangePresence,
  }
}

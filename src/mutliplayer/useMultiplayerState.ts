import { TDBinding, TDShape, TDUser, TldrawApp } from '@tldraw/tldraw'
import { useCallback, useEffect, useState } from 'react'
import * as yorkie from 'yorkie-js-sdk'

// 0. Yorkie Client declaration
let client: yorkie.Client<yorkie.Indexable>

// 0. Yorkie Document declaration
let doc: yorkie.Document<yorkie.Indexable>


// 0. Yorkie type for typescript
type YorkieType = {
  shapes: Record<string, TDShape>
  bindings: Record<string, TDBinding>
}

export function useMultiplayerState(roomId: string) {
  const [app, setApp] = useState<TldrawApp>()
  const [loading, setLoading] = useState(true)

  // Callbacks --------------

  const onMount = useCallback(
    (app: TldrawApp) => {
      app.loadRoom(roomId)
      app.pause()
      setApp(app)
    },
    [roomId]
  )

  // Update Yorkie doc when the app's shapes change.
  const onChangePage = useCallback(
    (
      app: TldrawApp,
      shapes: Record<string, TDShape | undefined>,
      bindings: Record<string, TDBinding | undefined>
    ) => {
      if (client === undefined || doc === undefined) return
      
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
    []
  )
  
  // undoManager will be implemented in further demo
  const onUndo = useCallback(() => {
  }, [])

  // redoManager will be implemented in further demo
  const onRedo = useCallback(() => {
  }, [])

  // Handle presence updates when the user's pointer / selection changes
  const onChangePresence = useCallback((app: TldrawApp, user: TDUser) => {
    if (client === undefined) return

    // need to limit rate of callback invocation
    // setting rate limit by prime numbers
    const time = new Date().getTime()
    if(time % 19 !== 0) return
    
    client.updatePresence("user", user)
  }, [])

  // Document Changes --------

  useEffect(() => {
    if (!app) return

    // Subscribe to changes
    function handleChanges() {
      let root = doc.getRoot()

      // WARNING: hard-coded section --------
      // parse proxy object to record
      let shapeJSON = JSON.stringify(root.shapes).replace(/\\\\\'/g, "'")
      let shapeRecord: Record<string, TDShape> = JSON.parse(JSON.parse(shapeJSON))
      let bindingRecord: Record<string, TDBinding> = JSON.parse(JSON.parse(JSON.stringify(root.bindings)))
      
      // replace page content with changed(propagated) records
      app?.replacePageContent(shapeRecord, bindingRecord, {})
    }
    
    let stillAlive = true
    
    // Setup the document's storage and subscriptions
    async function setupDocument() {
      try {
        // 01. active client with RPCAddr(envoy) with presence
        const options = {
          presence: {
            user: app?.currentUser,
          },
        }
        client = new yorkie.Client(
          `${process.env.REACT_APP_RPCADDR_ADDR}`, options
        )
        await client.activate()
        
        // 01-1. subscribe peers-changed event and update tldraw users state
        client.subscribe((event) => {
          if (event.type === 'peers-changed') {
            const peers = event.value[doc.getKey()]

            let users: TDUser[] = []
            for (const [clientID, presence] of Object.entries(peers)) {
             users.push(presence.user)
            }
            
            // WARNING: hard-coded section --------
            // remove all users
            Object.values(app!.room!.users).forEach((user) => {
              app?.removeUser(user.id)
            })
            // update users
            app?.updateUsers(
              users
            )
          }
        })

        // 02. attach document into the client with specifiy doc name
        doc = new yorkie.Document<YorkieType>('demo')
        await client.attach(doc)

        // 03. initialize document if document did not exists
        doc.update((root) => {
          if (!root.shapes) {
            root.shapes = {}
          }
          if (!root.bindings) {
            root.bindings = {}
          }
        }, 'create shapes/bindings object if not exists')
        
        // 04. subscribe document event and handle changes
        doc.subscribe((event) => {
          handleChanges()
        })

        // 05. sync client
        await client.sync()
        
        if (stillAlive) {  
          // Update the document with initial content
          handleChanges()
  
          // Zoom to fit the content
          if (app) {
            app.zoomToFit()
            if (app.zoom > 1) {
              app.resetZoom()
            }
          }
  
          setLoading(false)
        }
      } catch (e) {
        console.error(e)
      }
    }

    setupDocument()

    return () => {
      stillAlive = false
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

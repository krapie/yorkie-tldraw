import { Utils } from '@krapi0314/tldraw-core'
import { TDAsset, TldrawApp } from '@krapi0314/tldraw'
import { useCallback } from 'react'

export function useMultiplayerAssets() {
  const onAssetCreate = useCallback(
    // Send the asset to our upload endpoint, which in turn will send it to AWS and
    // respond with the URL of the uploaded file.
    async (app: TldrawApp, file: File, id: string): Promise<string | false> => {
      const fileName = encodeURIComponent((id ?? Utils.uniqueId()) + '-' + file.name)
      const fileType = encodeURIComponent(file.type)

      const res = await fetch(`${process.env.REACT_APP_AWS_PRESIGNED_URL_ADDR}?fileName=${fileName}&fileType=${fileType}`)
      const { uploadURL, fileUrl } = await res.json()
      
      console.log(fileUrl)
      const upload = await fetch(uploadURL, {
        method: 'PUT',
        body: file
      })

      if (!upload.ok) return false

      return fileUrl
    },
    []
  )

  const onAssetDelete = useCallback(async (app: TldrawApp, id: string): Promise<boolean> => {
    // noop
    return true
  }, [])

  const onAssetUpload = useCallback(
    // Send the asset to our upload endpoint, which in turn will send it to AWS and
    // respond with the URL of the uploaded file.

    async (app: TldrawApp, file: File, id: string): Promise<string | false> => {
      const fileName = encodeURIComponent((id ?? Utils.uniqueId()) + '-' + file.name)
      const fileType = encodeURIComponent(file.type)

      const res = await fetch(`${process.env.REACT_APP_AWS_PRESIGNED_URL_ADDR}?fileName=${fileName}&fileType=${fileType}`)
      const { uploadURL, fileUrl } = await res.json()

      const upload = await fetch(uploadURL, {
        method: 'PUT',
        body: file
      })

      if (!upload.ok) return false

      return fileUrl
    },
    []
  )

  return { 
    onAssetCreate, 
    onAssetDelete, 
    onAssetUpload }
}

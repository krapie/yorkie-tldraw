import { Utils } from '@tldraw/core'
import { TldrawApp } from '@tldraw/tldraw'
import { useCallback } from 'react'

export function useMultiplayerAssets() {
  const onAssetCreate = useCallback(
    // 1. Get presigned url from aws getPresignedUrl lambda function
    // 2. Upload (put) asset with presigned url
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

  const onAssetDelete = useCallback(
    // 1. Call deleteS3Object aws lamdba function to delete file on s3 bucket
    async (app: TldrawApp, assetId: string): Promise<boolean> => {
      let fileName: string = ""

      Object.entries(app.assets).forEach(([id, asset]) => {
        if (assetId === asset.id) {
          const filePath: string = asset.src
          fileName = filePath.split('/')[4]
        }
      })

      await fetch(`${process.env.REACT_APP_AWS_DELETE_OBJECT_ADDR}?fileName=${fileName}`)

      return true
    }, [])

  const onAssetUpload = useCallback(
    // 1. Get presigned url from aws getPresignedUrl lambda function
    // 2. Upload (put) asset with presigned url
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
    onAssetUpload
  }
}

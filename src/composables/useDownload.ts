import { saveAs } from 'file-saver'
import JSZip from 'jszip'

export function useDownload() {
  async function downloadZip(images: string[], zipName: string = 'emojis.zip') {
    if (images.length === 0)
      return

    const zip = new JSZip()
    images.forEach((dataUrl, index) => {
      // data:image/png;base64,......
      const base64Data = dataUrl.split(',')[1]
      // 文件名格式: emoji_行_列.png (为了方便排序，可以用索引)
      // 或者直接用 emoji_01.png, emoji_02.png
      const fileName = `emoji_${(index + 1).toString().padStart(3, '0')}.png`
      zip.file(fileName, base64Data, { base64: true })
    })

    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, zipName)
  }

  function downloadSingleImage(dataUrl: string, fileName: string) {
    saveAs(dataUrl, fileName)
  }

  function generateFileName(index: number) {
    return `emoji_${(index + 1).toString().padStart(3, '0')}.png`
  }

  return {
    downloadZip,
    downloadSingleImage,
    generateFileName,
  }
}
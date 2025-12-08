import { ref, nextTick } from 'vue'

export function useImageCropper() {
  const croppedImages = ref<string[]>([])
  const isProcessing = ref(false)

  async function doCrop(imageUrl: string, config: {
    rows: number
    cols: number
    startX: number
    startY: number
    totalWidth: number
    totalHeight: number
    paddingX: number
    paddingY: number
  }) {
    if (!imageUrl)
      return []

    isProcessing.value = true
    // 给一点时间让 UI 渲染 loading 状态
    await nextTick()

    const img = new Image()
    img.src = imageUrl

    return new Promise<string[]>((resolve) => {
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          isProcessing.value = false
          resolve([])
          return
        }

        // 计算单个格子的尺寸（基于总裁剪区域）
        const cellWidth = config.totalWidth / config.cols
        const cellHeight = config.totalHeight / config.rows

        const images: string[] = []

        for (let r = 0; r < config.rows; r++) {
          for (let c = 0; c < config.cols; c++) {
            // 计算源图像上的裁剪区域
            // 加上 padding (内缩)
            // 这里的 padding 是每个格子内部向内缩进的距离
            // 所以实际裁剪的起点要加上 paddingX/Y
            // 实际裁剪的宽高要减去 2 * paddingX/Y

            const srcX = config.startX + c * cellWidth + config.paddingX
            const srcY = config.startY + r * cellHeight + config.paddingY
            const srcW = cellWidth - 2 * config.paddingX
            const srcH = cellHeight - 2 * config.paddingY

            // 如果计算出的尺寸无效，跳过
            if (srcW <= 0 || srcH <= 0) {
              images.push('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7') // 透明占位图
              continue
            }

            canvas.width = srcW
            canvas.height = srcH
            // 清除画布
            ctx.clearRect(0, 0, srcW, srcH)
            // 绘制对应区域
            ctx.drawImage(
              img,
              srcX,
              srcY,
              srcW,
              srcH,
              0,
              0,
              srcW,
              srcH,
            )
            images.push(canvas.toDataURL('image/png'))
          }
        }

        croppedImages.value = images
        isProcessing.value = false
        resolve(images)
      }

      img.onerror = () => {
        isProcessing.value = false
        resolve([])
      }
    })
  }

  function clearCroppedImages() {
    croppedImages.value = []
  }

  return {
    croppedImages,
    isProcessing,
    doCrop,
    clearCroppedImages,
  }
}
import { nextTick, ref } from 'vue'

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
    removeBackground?: boolean
    backgroundColor?: string
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

            canvas.width = Math.round(srcW)
            canvas.height = Math.round(srcH)

            // 清除画布并确保透明背景
            ctx.clearRect(0, 0, srcW, srcH)

            // 确保画布支持透明度
            ctx.globalAlpha = 1.0
            ctx.globalCompositeOperation = 'source-over'

            const canvasW = Math.round(srcW)
            const canvasH = Math.round(srcH)

            // 先绘制对应区域
            ctx.drawImage(
              img,
              srcX,
              srcY,
              srcW,
              srcH,
              0,
              0,
              canvasW,
              canvasH,
            )

            // 如果需要去除背景
            if (config.removeBackground && config.backgroundColor && config.backgroundColor.trim() !== '') {
              const imageData = ctx.getImageData(0, 0, canvasW, canvasH)
              const data = imageData.data

              // 将背景色转换为RGB
              const hexToRgb = (hex: string) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
                return result
                  ? {
                      r: Number.parseInt(result[1], 16),
                      g: Number.parseInt(result[2], 16),
                      b: Number.parseInt(result[3], 16),
                    }
                  : { r: 255, g: 255, b: 255 }
              }

              const bgColor = hexToRgb(config.backgroundColor)

              // 遍历像素，更智能的背景去除
              for (let i = 0; i < data.length; i += 4) {
                const r = data[i]
                const g = data[i + 1]
                const b = data[i + 2]
                const a = data[i + 3]

                // 如果已经透明就跳过
                if (a === 0)
                  continue

                // 计算与背景色的距离
                const colorDiff = Math.sqrt(
                  (r - bgColor.r) ** 2
                  + (g - bgColor.g) ** 2
                  + (b - bgColor.b) ** 2,
                )

                // 计算亮度
                const brightness = (r + g + b) / 3

                // 计算饱和度（颜色鲜艳程度）
                const max = Math.max(r, g, b)
                const min = Math.min(r, g, b)
                const saturation = max === 0 ? 0 : (max - min) / max

                // 更严格的背景判断条件
                const isVerySimilarColor = colorDiff < 20 // 颜色非常接近
                const isSimilarBrightness = Math.abs(brightness - ((bgColor.r + bgColor.g + bgColor.b) / 3)) < 30
                const isLowSaturation = saturation < 0.15 // 饱和度低，接近灰度
                const isLightColor = brightness > 200 // 亮色

                // 只有同时满足所有条件才认为是背景
                if (isVerySimilarColor && isSimilarBrightness && isLowSaturation && isLightColor) {
                  data[i + 3] = 0 // alpha channel
                }
              }

              // 将处理后的图像数据重新绘制到画布
              ctx.putImageData(imageData, 0, 0)
            }

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

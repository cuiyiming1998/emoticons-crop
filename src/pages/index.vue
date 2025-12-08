<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useCropConfig } from '~/composables/useCropConfig'
import { useDownload } from '~/composables/useDownload'
import { useImageCropper } from '~/composables/useImageCropper'
import { useImageUpload } from '~/composables/useImageUpload'

defineOptions({
  name: 'IndexPage',
})

const fileInput = ref<HTMLInputElement | null>(null)
const isColorPicking = ref(false)
const colorPickerCursor = ref({ x: 0, y: 0 })
const {
  imageUrl,
  originalWidth,
  originalHeight,
  triggerUpload,
  onFileChange,
  resetImage,
} = useImageUpload(fileInput)

const {
  rows,
  cols,
  startX,
  startY,
  totalWidth,
  totalHeight,
  lockCenter,
  paddingX,
  paddingY,
  showGrid,
  removeBackground,
  backgroundColor,
  initConfig,
} = useCropConfig()

const {
  croppedImages,
  isProcessing,
  doCrop,
  clearCroppedImages,
} = useImageCropper()

const {
  downloadZip,
  downloadSingleImage,
  generateFileName,
} = useDownload()

// 当图片加载完成时初始化配置
watch([originalWidth, originalHeight], ([width, height]) => {
  if (width > 0 && height > 0) {
    initConfig(width, height)
  }
})

const handleFileChange = (e: Event) => {
  onFileChange(e)
}

const performCrop = async () => {
  if (!imageUrl.value)
    return

  await doCrop(imageUrl.value, {
    rows: rows.value,
    cols: cols.value,
    startX: startX.value,
    startY: startY.value,
    totalWidth: totalWidth.value,
    totalHeight: totalHeight.value,
    paddingX: paddingX.value,
    paddingY: paddingY.value,
    removeBackground: removeBackground.value,
    backgroundColor: backgroundColor.value,
  })
}

const handleDownloadZip = () => {
  downloadZip(croppedImages.value)
}

const handleDownloadSingle = (dataUrl: string, index: number) => {
  downloadSingleImage(dataUrl, generateFileName(index))
}

const handleClearImage = () => {
  resetImage()
  clearCroppedImages()
  stopColorPicking()
}

const startColorPicking = () => {
  isColorPicking.value = true
}

const stopColorPicking = () => {
  isColorPicking.value = false
}

const pickColor = (event: MouseEvent) => {
  if (!isColorPicking.value || !imageUrl.value)
    return

  const target = event.target as HTMLElement
  if (!target || target.tagName !== 'IMG')
    return

  const rect = target.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  // 创建canvas来获取像素颜色
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx)
    return

  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)

    // 计算在原图上的坐标
    const scaleX = img.width / rect.width
    const scaleY = img.height / rect.height
    const imgX = Math.floor(x * scaleX)
    const imgY = Math.floor(y * scaleY)

    const imageData = ctx.getImageData(imgX, imgY, 1, 1)
    const [r, g, b] = imageData.data

    // 转换为十六进制
    const toHex = (n: number) => n.toString(16).padStart(2, '0')
    backgroundColor.value = `#${toHex(r)}${toHex(g)}${toHex(b)}`
    stopColorPicking()
  }
  img.src = imageUrl.value
}

const handleMouseMove = (event: MouseEvent) => {
  if (isColorPicking.value) {
    colorPickerCursor.value = { x: event.clientX, y: event.clientY }
  }
}

// 监听配置变化，自动重新裁剪
watchDebounced([
  imageUrl,
  rows,
  cols,
  startX,
  startY,
  totalWidth,
  totalHeight,
  paddingX,
  paddingY,
  removeBackground,
  backgroundColor,
], () => {
  if (imageUrl.value) {
    performCrop()
  }
}, { debounce: 500, maxWait: 2000 })

// 全局事件监听
onMounted(() => {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isColorPicking.value) {
      stopColorPicking()
    }
  })
})
</script>

<template>
  <div class="py-10 bg-gray-50/30 flex-1 transition-colors duration-300 dark:bg-[#0a0a0a]">
    <div class="mx-auto px-4 max-w-7xl lg:px-8 sm:px-6">
      <div class="mb-12 text-center">
        <div class="bg-primary/10 ring-primary/20 text-primary mb-5 rounded-2xl inline-flex h-14 w-14 ring-1 shadow-sm items-center justify-center">
          <div i-carbon-image-search class="text-2xl" />
        </div>
        <h1 class="text-3xl text-gray-900 tracking-tight font-bold mb-3 dark:text-white">
          表情包裁剪
        </h1>
        <p class="text-base text-gray-500 font-medium dark:text-gray-400">
          上传大图，自动切割，一键打包带走～ (≧∇≦)ﾉ
        </p>
      </div>

      <div class="gap-10 grid items-start lg:grid-cols-12">
        <div class="space-y-8 lg:col-span-4">
          <div
            class="group p-1 border border-gray-100 rounded-2xl bg-white transition-all relative overflow-hidden dark:border-gray-800 dark:bg-gray-900 hover:shadow-lg"
            @click="triggerUpload"
          >
            <div
              class="group-hover:bg-primary/5 group-hover:border-primary/50 border-2 border-gray-200 rounded-xl border-dashed bg-gray-50/50 flex flex-col min-h-[200px] cursor-pointer transition-colors items-center justify-center relative dark:border-gray-700 dark:bg-gray-800/50"
            >
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                hidden
                @change="handleFileChange"
              >

              <div v-if="imageUrl" class="p-4 w-full relative">
                <img :src="imageUrl" class="mx-auto rounded-lg max-h-48 shadow-sm object-contain">
                <div class="rounded-xl bg-black/0 flex transition-colors items-center inset-0 justify-center absolute group-hover:bg-black/10">
                  <span class="text-xs text-gray-700 font-medium px-3 py-1.5 rounded-full bg-white/90 opacity-0 shadow-sm transition-opacity backdrop-blur group-hover:opacity-100">
                    更换图片
                  </span>
                </div>
              </div>

              <div v-else class="p-6 text-center flex flex-col items-center">
                <div class="mb-3 p-3 rounded-full bg-white ring-1 ring-gray-100 shadow-sm dark:bg-gray-800 dark:ring-gray-700">
                  <div i-carbon-upload class="text-primary text-xl" />
                </div>
                <p class="text-sm text-gray-900 font-medium dark:text-white">
                  点击上传图片
                </p>
                <p class="text-xs text-gray-500 mt-1 dark:text-gray-400">
                  支持 JPG, PNG 格式
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            class="text-red-600 font-medium px-4 py-3 border-2 border-red-200 rounded-xl bg-white flex gap-2 w-full transition-all duration-200 items-center justify-center dark:text-red-400 dark:border-red-800 disabled:border-red-200 hover:border-red-300 dark:bg-gray-900 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md dark:hover:border-red-700 disabled:dark:border-red-800 dark:hover:bg-red-950/50 disabled:hover:bg-transparent disabled:hover:shadow-none disabled:hover:translate-y-0 hover:-translate-y-0.5"
            :disabled="!imageUrl"
            @click="handleClearImage"
          >
            <div i-carbon-trash-can class="text-lg" />
            清除图片
          </button>

          <div class="p-6 border border-gray-100 rounded-2xl bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div class="space-y-4">
              <div class="text-sm text-gray-900 font-semibold flex gap-2 items-center dark:text-white">
                <div i-carbon-settings class="text-primary" />
                网格设置
              </div>

              <div class="gap-4 grid grid-cols-2">
                <div class="space-y-1.5">
                  <label class="text-xs text-gray-500 font-medium dark:text-gray-400">行数 (Rows)</label>
                  <input
                    v-model.number="rows"
                    type="number"
                    min="1"
                    max="20"
                    class="modern-input"
                  >
                </div>
                <div class="space-y-1.5">
                  <label class="text-xs text-gray-500 font-medium dark:text-gray-400">列数 (Cols)</label>
                  <input
                    v-model.number="cols"
                    type="number"
                    min="1"
                    max="20"
                    class="modern-input"
                  >
                </div>
              </div>
            </div>

            <div class="my-6 bg-gray-100 h-px dark:bg-gray-800" />

            <!-- Area Settings -->
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="text-sm text-gray-900 font-semibold flex gap-2 items-center dark:text-white">
                  <div i-carbon-move class="text-primary" />
                  区域微调
                </div>
                <label class="px-2.5 py-1 rounded-full bg-gray-50 flex gap-2 cursor-pointer transition-colors items-center dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <input v-model="lockCenter" type="checkbox" class="text-primary focus:ring-primary border-gray-300 rounded h-3.5 w-3.5">
                  <span class="text-xs text-gray-600 font-medium dark:text-gray-300">锁定居中</span>
                </label>
              </div>

              <div class="gap-3 grid grid-cols-2">
                <div class="space-y-1">
                  <label class="text-[10px] text-gray-400 tracking-wider uppercase">X (Left)</label>
                  <input v-model.number="startX" type="number" class="modern-input">
                </div>
                <div class="space-y-1">
                  <label class="text-[10px] text-gray-400 tracking-wider uppercase">Y (Top)</label>
                  <input v-model.number="startY" type="number" class="modern-input">
                </div>
                <div class="space-y-1">
                  <label class="text-[10px] text-gray-400 tracking-wider uppercase">Width</label>
                  <input v-model.number="totalWidth" type="number" class="modern-input">
                </div>
                <div class="space-y-1">
                  <label class="text-[10px] text-gray-400 tracking-wider uppercase">Height</label>
                  <input v-model.number="totalHeight" type="number" class="modern-input">
                </div>
              </div>
            </div>

            <div class="my-6 bg-gray-100 h-px dark:bg-gray-800" />

            <div class="space-y-5">
              <div class="text-sm text-gray-900 font-semibold flex gap-2 items-center dark:text-white">
                <div i-carbon-cut class="text-primary" />
                边缘内缩
              </div>

              <div class="space-y-4">
                <div class="space-y-2">
                  <div class="text-xs flex justify-between">
                    <span class="text-gray-500">横向 (X)</span>
                    <span class="text-gray-900 font-medium dark:text-white">{{ paddingX }}px</span>
                  </div>
                  <input
                    v-model.number="paddingX"
                    type="range"
                    min="0"
                    max="50"
                    class="modern-range"
                  >
                </div>
                <div class="space-y-2">
                  <div class="text-xs flex justify-between">
                    <span class="text-gray-500">纵向 (Y)</span>
                    <span class="text-gray-900 font-medium dark:text-white">{{ paddingY }}px</span>
                  </div>
                  <input
                    v-model.number="paddingY"
                    type="range"
                    min="0"
                    max="50"
                    class="modern-range"
                  >
                </div>
              </div>
            </div>

            <div class="my-6 bg-gray-100 h-px dark:bg-gray-800" />

            <!-- Background Settings -->
            <div class="space-y-4">
              <div class="text-sm text-gray-900 font-semibold flex gap-2 items-center dark:text-white">
                <div i-carbon-palette class="text-primary" />
                背景设置
              </div>

              <div class="space-y-4">
                <!-- 去除背景色开关 -->
                <div class="bg-gradient-to-r p-3 border border-gray-200 rounded-xl from-gray-50 to-gray-100 dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-900/50">
                  <label class="flex gap-3 cursor-pointer select-none items-center">
                    <div class="relative">
                      <input
                        v-model="removeBackground"
                        type="checkbox"
                        class="peer sr-only"
                      >
                      <div class="peer peer-checked:bg-primary rounded-full bg-gray-200 h-6 w-11 peer-focus:outline-none after:rounded-full after:bg-white dark:bg-gray-700 after:h-5 after:w-5 after:content-[''] after:transition-all after:left-[2px] after:top-[2px] after:absolute peer-checked:after:border-white peer-checked:after:translate-x-full" />
                    </div>
                    <div class="flex-1">
                      <div class="text-sm text-gray-900 font-medium dark:text-white">
                        启用背景去除
                      </div>
                      <div class="text-xs text-gray-500 dark:text-gray-400">
                        智能移除指定颜色的背景
                      </div>
                    </div>
                  </label>
                </div>

                <!-- 颜色选择区域 -->
                <div
                  v-if="removeBackground"
                  class="from-primary/8 via-primary/5 to-primary/8 bg-gradient-to-br border-primary/20 dark:from-primary/12 dark:via-primary/8 dark:to-primary/12 dark:border-primary/30 border rounded-2xl shadow-lg relative overflow-hidden"
                >
                  <div class="bg-gradient-to-r opacity-40 inset-0 absolute from-transparent to-transparent via-white/20" />
                  <div class="p-5 relative space-y-4">
                    <div class="flex items-center justify-between">
                      <div class="flex gap-3 items-center">
                        <div class="relative">
                          <div class="bg-primary rounded-full h-3 w-3 animate-pulse" />
                          <div class="bg-primary/30 rounded-full h-3 w-3 inset-0 absolute animate-ping" />
                        </div>
                        <label class="text-sm text-gray-900 font-bold dark:text-white">
                          背景颜色选择
                        </label>
                      </div>
                      <div class="flex gap-2 items-center">
                        <div class="group relative">
                          <div
                            class="border-2 border-white rounded-xl h-10 w-10 shadow-lg transition-transform group-hover:scale-110"
                            :style="{ backgroundColor: backgroundColor || '#FFFFFF' }"
                          />
                          <div class="bg-gradient-to-r from-primary/20 to-primary/0 rounded-xl absolute blur-sm -inset-1" />
                        </div>
                      </div>
                    </div>

                    <div class="flex gap-3">
                      <button
                        type="button"
                        class="group flex-1 relative"
                        @click="isColorPicking ? stopColorPicking() : startColorPicking()"
                      >
                        <div class="bg-gradient-to-r from-primary to-primary/80 rounded-xl opacity-0 transition-opacity inset-0 absolute blur group-hover:opacity-100" />
                        <div
                          class="text-sm font-medium px-4 py-3 border-2 rounded-xl bg-white/90 flex gap-2 shadow-md transition-all duration-300 items-center justify-center relative backdrop-blur-sm dark:border-gray-600 dark:bg-gray-800/90 hover:shadow-xl hover:-translate-y-0.5"
                          :class="{
                            'border-primary/40 bg-primary/10 text-primary shadow-lg shadow-primary/25 dark:bg-primary/20 dark:border-primary/50': isColorPicking,
                            'border-gray-200 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white': !isColorPicking,
                          }"
                        >
                          <div
                            class="text-lg transition-transform duration-300"
                            :class="{ 'animate-bounce': isColorPicking }"
                          >
                            <div v-if="isColorPicking" i-carbon-close />
                            <div v-else i-carbon-pipette />
                          </div>
                          <span class="font-semibold">{{ isColorPicking ? '取消取色' : '从图片取色' }}</span>
                        </div>
                      </button>

                      <div class="group flex-1 relative">
                        <div class="bg-gradient-to-r via-primary/10 rounded-xl opacity-0 transition-opacity inset-0 absolute from-transparent to-transparent blur group-hover:opacity-100" />
                        <input
                          v-model="backgroundColor"
                          type="text"
                          placeholder="#FFFFFF"
                          class="dark:focus:border-primary/40 text-sm font-medium px-4 py-3 pr-12 border-2 rounded-xl bg-white/90 w-full shadow-md transition-all duration-300 relative backdrop-blur-sm dark:text-white dark:border-gray-600 dark:bg-gray-800/90 focus:shadow-xl hover:shadow-lg focus:-translate-y-0.5"
                        >
                        <div class="transform transition-transform duration-300 right-3 top-1/2 absolute -translate-y-1/2 group-hover:scale-110">
                          <div
                            class="border-2 border-white rounded-lg h-6 w-6 shadow-md"
                            :style="{ backgroundColor: backgroundColor || '#FFFFFF' }"
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      v-if="isColorPicking"
                      class="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30 px-4 py-3 border rounded-xl relative overflow-hidden"
                    >
                      <div class="bg-gradient-to-r via-primary/20 inset-0 absolute animate-pulse from-transparent to-transparent" />
                      <div class="text-primary text-sm font-medium flex gap-2 items-center justify-center relative">
                        <div class="relative">
                          <div i-carbon-information class="text-base" />
                          <div class="bg-primary/30 rounded-full inset-0 absolute animate-ping" />
                        </div>
                        <span class="font-semibold">点击预览区域图片上的任意位置取色</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-8 space-y-4">
              <!-- 预览网格开关 -->
              <div class="bg-gradient-to-r p-3 border border-gray-200 rounded-xl from-gray-50 to-gray-100 dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-900/50">
                <label class="flex gap-3 cursor-pointer select-none items-center">
                  <div class="relative">
                    <input
                      v-model="showGrid"
                      type="checkbox"
                      class="peer sr-only"
                    >
                    <div class="peer peer-checked:bg-primary rounded-full bg-gray-200 h-6 w-11 peer-focus:outline-none after:rounded-full after:bg-white dark:bg-gray-700 after:h-5 after:w-5 after:content-[''] after:transition-all after:left-[2px] after:top-[2px] after:absolute peer-checked:after:border-white peer-checked:after:translate-x-full" />
                  </div>
                  <div class="flex-1">
                    <div class="text-sm text-gray-900 font-medium dark:text-white">
                      显示预览网格
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">
                      在图片上显示裁剪区域的网格线
                    </div>
                  </div>
                </label>
              </div>

              <button
                class="bg-primary border-primary/20 dark:border-primary/30 shadow-primary/30 hover:shadow-primary/40 hover:border-primary/40 dark:hover:border-primary/50 text-sm text-gray-900 font-semibold px-4 py-3 border-2 rounded-xl flex gap-2 w-full shadow-lg transition-all items-center justify-center dark:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0 hover:-translate-y-0.5"
                :disabled="croppedImages.length === 0 || isProcessing"
                @click="handleDownloadZip"
              >
                <div v-if="isProcessing" i-carbon-circle-dash animate-spin />
                <div v-else i-carbon-download />
                打包下载 (ZIP)
              </button>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-8 lg:col-span-8">
          <GeminiPrompt v-if="!imageUrl" />

          <div
            v-if="!imageUrl"
            class="text-gray-400 border border-gray-200 rounded-2xl border-dashed bg-gray-50 flex flex-col min-h-[400px] items-center justify-center dark:border-gray-800 dark:bg-gray-900/50"
          >
            <div class="mb-4 p-4 rounded-full bg-white shadow-sm dark:bg-gray-800">
              <div i-carbon-image class="text-4xl text-gray-300 dark:text-gray-600" />
            </div>
            <p class="text-sm font-medium">
              请先在左侧上传图片
            </p>
          </div>

          <template v-else>
            <div class="border border-gray-100 rounded-2xl bg-white shadow-lg overflow-hidden dark:border-gray-800 dark:bg-gray-900/50 dark:backdrop-blur-xl">
              <div class="bg-gradient-to-r px-5 py-4 border-b border-gray-100/60 from-gray-50 to-white dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-900/50">
                <h3 class="text-sm text-gray-900 font-bold flex gap-2 items-center dark:text-white">
                  <div class="bg-primary/10 p-1.5 rounded-lg">
                    <div i-carbon-image class="text-primary text-base" />
                  </div>
                  预览区域
                  <span v-if="isColorPicking" class="bg-primary/10 text-primary text-xs font-medium ml-auto px-2.5 py-1 rounded-full flex gap-1 items-center">
                    <div class="bg-primary rounded-full h-1.5 w-1.5 animate-pulse" />
                    取色中
                  </span>
                </h3>
              </div>

              <div class="p-8 bg-gray-50/80 flex justify-center overflow-auto dark:bg-gray-900/80">
                <div class="rounded-2xl bg-white ring-1 ring-gray-900/5 shadow-2xl relative overflow-hidden dark:bg-gray-800 dark:ring-white/10">
                  <img
                    :src="imageUrl"
                    class="max-w-full block transition-transform duration-300 ease-out hover:scale-[1.02]"
                    :class="{ 'cursor-crosshair': isColorPicking }"
                    :style="{ maxHeight: '520px', imageRendering: 'auto' }"
                    @click="pickColor"
                    @mousemove="handleMouseMove"
                  >
                  <div
                    v-if="showGrid"
                    class="border-primary/60 border pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.25)] box-content absolute"
                    :style="{
                      left: `${(startX / originalWidth) * 100}%`,
                      top: `${(startY / originalHeight) * 100}%`,
                      width: `${(totalWidth / originalWidth) * 100}%`,
                      height: `${(totalHeight / originalHeight) * 100}%`,
                    }"
                  >
                    <div class="h-full w-full relative">
                      <div
                        v-for="i in cols - 1"
                        :key="`v-${i}`"
                        class="border-primary/40 border-l bottom-0 top-0 absolute"
                        :style="{ left: `${(i / cols) * 100}%` }"
                      />
                      <div
                        v-for="i in rows - 1"
                        :key="`h-${i}`"
                        class="border-primary/40 border-t left-0 right-0 absolute"
                        :style="{ top: `${(i / rows) * 100}%` }"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="border border-gray-100 rounded-2xl bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900/50 dark:backdrop-blur-xl">
              <div class="bg-gradient-to-r px-5 py-4 border-b border-gray-100/60 flex items-center justify-between from-gray-50 to-white dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-900/50">
                <h3 class="text-sm text-gray-900 font-bold flex gap-2 items-center dark:text-white">
                  <div class="bg-primary/10 p-1.5 rounded-lg">
                    <div i-carbon-grid class="text-primary text-base" />
                  </div>
                  裁剪结果
                  <span class="bg-gradient-to-r from-primary/10 to-primary/5 text-primary border-primary/20 text-xs font-bold ml-2 px-3 py-1 border rounded-full">{{ croppedImages.length }} 张</span>
                </h3>
                <div class="flex gap-2 items-center">
                  <span class="text-xs text-gray-400 flex gap-1 items-center">
                    <div i-carbon-information class="text-gray-300" />
                    点击图片可单独下载
                  </span>
                </div>
              </div>

              <div class="p-6">
                <div
                  v-if="croppedImages.length > 0"
                  class="bg-gradient-to-br p-4 rounded-2xl gap-3 grid overflow-hidden from-gray-50/50 to-gray-100/30 dark:from-gray-800/30 dark:to-gray-900/50 dark:backdrop-blur"
                  :style="{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }"
                >
                  <div
                    v-for="(img, idx) in croppedImages"
                    :key="idx"
                    class="group hover:shadow-primary/5 hover:ring-primary/60 dark:hover:shadow-primary/10 rounded-xl bg-white aspect-square cursor-pointer ring-1 ring-gray-900/8 shadow-md transition-all duration-300 relative overflow-hidden dark:bg-gray-800/90 dark:ring-white/10 hover:shadow-xl hover:-translate-y-1"
                    :title="`下载第 ${idx + 1} 张图片`"
                    @click="handleDownloadSingle(img, idx)"
                  >
                    <img
                      :src="img"
                      class="h-full w-full transition-all duration-200 relative z-10 object-contain group-hover:opacity-85"
                    >
                    <div class="bg-gradient-to-t p-3 opacity-100 flex transition-all duration-200 items-center inset-0 justify-center absolute z-20 from-black/60 to-transparent via-black/20">
                      <div class="bg-primary text-xs text-white font-semibold px-3 py-2 border border-white/20 rounded-lg opacity-0 flex gap-1.5 shadow-2xl translate-y-4 scale-95 transform transition-all duration-200 items-center backdrop-blur-sm group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100">
                        <div i-carbon-download class="text-sm" />
                        下载
                      </div>
                    </div>
                    <div class="text-xs text-white font-medium px-2 py-1 rounded-lg bg-black/60 opacity-0 transition-all duration-200 right-2 top-2 absolute z-20 backdrop-blur-sm group-hover:opacity-100">
                      #{{ idx + 1 }}
                    </div>
                  </div>
                </div>

                <div v-else-if="isProcessing" class="py-24 flex flex-col items-center justify-center">
                  <div class="relative">
                    <div i-carbon-circle-dash class="text-primary text-4xl animate-spin" />
                    <div class="bg-primary/20 rounded-full inset-0 absolute animate-pulse blur-xl" />
                  </div>
                  <div class="text-sm text-gray-500 font-medium mt-4 flex gap-2 items-center">
                    <div class="bg-primary rounded-full h-1.5 w-1.5 animate-pulse" />
                    正在处理中...
                  </div>
                </div>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modern-input {
  @apply w-full rounded-lg border-0 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 transition-all focus:bg-white focus:ring-2 focus:ring-primary/50 focus:outline-none dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:focus:bg-gray-800;
}

.modern-range {
  @apply h-2 w-full appearance-none rounded-full bg-gray-200 dark:bg-gray-700;
}

.modern-range::-webkit-slider-thumb {
  @apply h-4 w-4 appearance-none rounded-full bg-white shadow ring-2 ring-primary transition-transform hover:scale-110 cursor-pointer;
}

.bg-checkerboard-light {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMCAwSDRWNEgwem00IDhINFY0SDB6IiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+');
}

.bg-checkerboard-dark {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMxYTFhMWEiLz48cGF0aCBkPSJNMCAwSDRWNEgwem00IDhINFY0SDB6IiBmaWxsPSIjMjYyNjI2Ii8+PC9zdmc+');
}
</style>

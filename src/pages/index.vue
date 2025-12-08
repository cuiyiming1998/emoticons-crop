<script setup lang="ts">
import { watch } from 'vue'
import { useCropConfig } from '~/composables/useCropConfig'
import { useDownload } from '~/composables/useDownload'
import { useImageCropper } from '~/composables/useImageCropper'
import { useImageUpload } from '~/composables/useImageUpload'

defineOptions({
  name: 'IndexPage',
})

const fileInput = ref<HTMLInputElement | null>(null)
const {
  imageUrl,
  originalWidth,
  originalHeight,
  triggerUpload,
  onFileChange,
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
  initConfig,
} = useCropConfig()

const {
  croppedImages,
  isProcessing,
  doCrop,
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

function handleFileChange(e: Event) {
  onFileChange(e)
}

async function performCrop() {
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
  })
}

function handleDownloadZip() {
  downloadZip(croppedImages.value)
}

function handleDownloadSingle(dataUrl: string, index: number) {
  downloadSingleImage(dataUrl, generateFileName(index))
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
], () => {
  if (imageUrl.value) {
    performCrop()
  }
}, { debounce: 500, maxWait: 2000 })
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

      <div class="gap-8 grid items-start lg:grid-cols-12">
        <div class="space-y-6 lg:col-span-4">
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

            <div class="mt-8">
              <label class="text-sm text-gray-600 mb-4 flex gap-2 cursor-pointer select-none items-center dark:text-gray-400">
                <input v-model="showGrid" type="checkbox" class="text-primary focus:ring-primary border-gray-300 rounded">
                显示预览网格
              </label>

              <button
                class="shadow-primary/30 bg-primary border-primary/20 hover:shadow-primary/40 hover:border-primary/40 dark:border-primary/30 dark:hover:border-primary/50 text-sm text-gray-900 font-semibold px-4 py-3 border-2 rounded-xl flex gap-2 w-full shadow-lg transition-all items-center justify-center dark:text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0 hover:-translate-y-0.5"
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

        <div class="flex flex-col gap-6 lg:col-span-8">
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
            <div class="border border-gray-100 rounded-2xl bg-white shadow-sm overflow-hidden dark:border-gray-800 dark:bg-gray-900">
              <div class="px-4 py-3 border-b border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/50">
                <h3 class="text-sm text-gray-900 font-bold flex gap-2 items-center dark:text-white">
                  <div i-carbon-image class="text-primary" />
                  预览区域
                </h3>
              </div>

              <div class="bg-checkerboard-light dark:bg-checkerboard-dark p-6 flex justify-center overflow-auto">
                <div class="rounded-lg bg-white inline-block shadow-lg relative overflow-hidden dark:bg-gray-800">
                  <img
                    :src="imageUrl"
                    class="max-w-full block"
                    :style="{ maxHeight: '500px' }"
                  >
                  <div
                    v-if="showGrid"
                    class="border-primary/80 border pointer-events-none shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] box-content absolute"
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
                        class="border-primary/50 border-l bottom-0 top-0 absolute"
                        :style="{ left: `${(i / cols) * 100}%` }"
                      />
                      <div
                        v-for="i in rows - 1"
                        :key="`h-${i}`"
                        class="border-primary/50 border-t left-0 right-0 absolute"
                        :style="{ top: `${(i / rows) * 100}%` }"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="border border-gray-100 rounded-2xl bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div class="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between dark:border-gray-800 dark:bg-gray-800/50">
                <h3 class="text-sm text-gray-900 font-bold flex gap-2 items-center dark:text-white">
                  <div i-carbon-grid class="text-primary" />
                  裁剪结果
                  <span class="bg-primary/10 text-primary text-xs font-medium ml-2 px-2 py-0.5 rounded-full">{{ croppedImages.length }} 张</span>
                </h3>
                <span class="text-xs text-gray-400">
                  点击图片可单独下载
                </span>
              </div>

              <div class="p-6">
                <div
                  v-if="croppedImages.length > 0"
                  class="p-2 rounded-xl bg-gray-50 gap-2 grid overflow-hidden dark:bg-gray-950/50"
                  :style="{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }"
                >
                  <div
                    v-for="(img, idx) in croppedImages"
                    :key="idx"
                    class="group hover:ring-primary rounded-lg bg-white aspect-square cursor-pointer ring-1 ring-gray-900/5 shadow-sm transition-all relative overflow-hidden dark:bg-gray-800 hover:ring-2 dark:ring-white/10"
                    title="点击下载"
                    @click="handleDownloadSingle(img, idx)"
                  >
                    <div class="bg-checkerboard-light dark:bg-checkerboard-dark opacity-50 inset-0 absolute" />
                    <img :src="img" class="h-full w-full relative object-contain">
                    <div class="bg-black/40 opacity-0 flex transition-all duration-200 items-center inset-0 justify-center absolute backdrop-blur-[2px] group-hover:opacity-100">
                      <div class="text-primary rounded-full bg-white flex h-8 w-8 shadow-lg items-center justify-center">
                        <div i-carbon-download />
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else-if="isProcessing" class="py-20 flex flex-col items-center justify-center">
                  <div i-carbon-circle-dash class="text-primary text-3xl mb-4 animate-spin" />
                  <p class="text-sm text-gray-500 font-medium">
                    正在处理中...
                  </p>
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

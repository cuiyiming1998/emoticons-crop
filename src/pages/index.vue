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
} = useImageUpload(unref(fileInput))

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
  <div mx-auto p-4 max-w-6xl>
    <div mb-8 text-center>
      <div text-primary i-carbon-image-search text-4xl inline-block />
      <h1 text-2xl font-bold mt-2>
        表情包裁剪神器
      </h1>
      <p text-gray-500>
        上传大图，自动切割，一键打包带走～ (≧∇≦)ﾉ
      </p>
    </div>

    <div grid="~ cols-1 lg:cols-12 gap-8">
      <div class="lg:col-span-3" flex flex-col gap-6>
        <div
          class="hover:bg-primary/5 hover:border-primary dark:hover:bg-primary/10 p-6 text-center border-2 border-gray-300 rounded-xl border-dashed cursor-pointer transition dark:border-gray-700"
          @click="triggerUpload"
        >
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            hidden
            @change="handleFileChange"
          >
          <div v-if="imageUrl" class="relative">
            <img :src="imageUrl" class="mx-auto rounded max-h-32 shadow-sm object-contain">
            <div text-xs text-gray-400 mt-2 dark:text-gray-500>
              点击更换图片
            </div>
          </div>
          <div v-else flex flex-col cursor-pointer items-center justify-center>
            <div i-carbon-upload text-4xl text-gray-400 mb-2 dark:text-gray-500 />
            <p text-sm text-gray-500 dark:text-gray-400>
              点击上传图片
            </p>
          </div>
        </div>

        <div class="p-4 border border-gray-200 rounded-xl bg-gray-50/50 space-y-6 dark:border-gray-700 dark:bg-gray-800/50">
          <div>
            <h3 text-sm font-bold mb-3 flex gap-2 items-center>
              <div i-carbon-settings />
              网格设置
            </h3>
            <div class="flex flex-wrap gap-3">
              <div class="flex-1 min-w-20">
                <label text-xs text-gray-500 font-medium mb-1 block dark:text-gray-400>行数 (Rows)</label>
                <input
                  v-model.number="rows"
                  type="number"
                  min="1"
                  max="20"
                  class="input-base"
                >
              </div>
              <div class="flex-1 min-w-20">
                <label text-xs text-gray-500 font-medium mb-1 block dark:text-gray-400>列数 (Cols)</label>
                <input
                  v-model.number="cols"
                  type="number"
                  min="1"
                  max="20"
                  class="input-base"
                >
              </div>
            </div>
          </div>

          <hr border-gray-200 dark:border-gray-700>

          <div>
            <div mb-3 flex items-center justify-between>
              <h3 text-sm font-bold flex gap-2 items-center>
                <div i-carbon-move />
                区域微调
              </h3>
              <label class="text-primary text-xs flex gap-1 cursor-pointer select-none items-center">
                <input v-model="lockCenter" type="checkbox" class="text-primary focus:ring-primary rounded">
                锁定居中
              </label>
            </div>

            <div class="mb-3 flex flex-wrap gap-3">
              <div class="flex-1 min-w-24">
                <label text-xs text-gray-500 font-medium mb-1 block dark:text-gray-400>起始 X (Left)</label>
                <input
                  v-model.number="startX"
                  type="number"
                  class="input-base"
                >
              </div>
              <div class="flex-1 min-w-24">
                <label text-xs text-gray-500 font-medium mb-1 block dark:text-gray-400>起始 Y (Top)</label>
                <input
                  v-model.number="startY"
                  type="number"
                  class="input-base"
                >
              </div>
              <div class="flex-1 min-w-24">
                <label text-xs text-gray-500 font-medium mb-1 block dark:text-gray-400>总宽 (Width)</label>
                <input
                  v-model.number="totalWidth"
                  type="number"
                  class="input-base"
                >
              </div>
              <div class="flex-1 min-w-24">
                <label text-xs text-gray-500 font-medium mb-1 block dark:text-gray-400>总高 (Height)</label>
                <input
                  v-model.number="totalHeight"
                  type="number"
                  class="input-base"
                >
              </div>
            </div>
            <p text-xs text-gray-400 leading-tight dark:text-gray-500>
              勾选"锁定居中"后，调整位置会自动缩放尺寸以保持对称。
            </p>
          </div>

          <hr border-gray-200 dark:border-gray-700>

          <div>
            <h3 text-sm font-bold mb-3 flex gap-2 items-center>
              <div i-carbon-cut />
              边缘内缩 (Padding)
            </h3>

            <div class="space-y-3">
              <div>
                <div text-xs mb-1 flex justify-between>
                  <span text-gray-500 dark:text-gray-400>横向 (X Padding)</span>
                  <span>{{ paddingX }}px</span>
                </div>
                <input
                  v-model.number="paddingX"
                  type="range"
                  min="0"
                  max="50"
                  class="accent-primary appearance-none rounded-lg bg-gray-200 h-2 w-full cursor-pointer dark:bg-gray-700"
                >
              </div>
              <div>
                <div text-xs mb-1 flex justify-between>
                  <span text-gray-500 dark:text-gray-400>纵向 (Y Padding)</span>
                  <span>{{ paddingY }}px</span>
                </div>
                <input
                  v-model.number="paddingY"
                  type="range"
                  min="0"
                  max="50"
                  class="accent-primary appearance-none rounded-lg bg-gray-200 h-2 w-full cursor-pointer dark:bg-gray-700"
                >
              </div>
            </div>
          </div>

          <hr border-gray-200 dark:border-gray-700>

          <div>
            <label class="text-sm flex gap-2 cursor-pointer select-none items-center">
              <input v-model="showGrid" type="checkbox" class="text-primary focus:ring-primary rounded">
              显示预览网格
            </label>
          </div>

          <div mt-6>
            <button
              class="bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex gap-2 w-full shadow-lg transition items-center justify-center btn disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="croppedImages.length === 0 || isProcessing"
              @click="handleDownloadZip"
            >
              <div v-if="isProcessing" i-carbon-circle-dash animate-spin />
              <div v-else i-carbon-download />
              下载全部 (ZIP)
            </button>
          </div>
        </div>
      </div>

      <!-- 右侧预览区 -->
      <div class="flex flex-col gap-8 lg:col-span-9">
        <div v-if="!imageUrl" text-gray-400 border border-gray-200 rounded-xl bg-gray-50 flex h-full min-h-60 items-center justify-center dark:text-gray-500 dark:border-gray-700 dark:bg-gray-800>
          <div text-center>
            <div i-carbon-image text-4xl mb-2 inline-block />
            <p>请先在左侧上传图片哦～</p>
          </div>
        </div>

        <template v-else>
          <!-- 原图预览 -->
          <div>
            <h3 font-bold mb-4 flex gap-2 items-center>
              <div i-carbon-image />
              原图预览
            </h3>
            <div class="p-4 border border-gray-200 rounded-xl bg-gray-100/50 flex justify-center overflow-auto dark:border-gray-700 dark:bg-gray-800/50">
              <div class="bg-checkerboard rounded bg-white/50 inline-block shadow-sm relative dark:bg-gray-800/50">
                <img
                  :src="imageUrl"
                  class="max-w-full block"
                  :style="{ maxHeight: '600px' }"
                >
                <!-- 网格覆盖层 -->
                <div
                  v-if="showGrid"
                  class="border border-red-500 pointer-events-none box-content absolute"
                  :style="{
                    left: `${(startX / originalWidth) * 100}%`,
                    top: `${(startY / originalHeight) * 100}%`,
                    width: `${(totalWidth / originalWidth) * 100}%`,
                    height: `${(totalHeight / originalHeight) * 100}%`,
                  }"
                >
                  <!-- 绘制内部网格线 -->
                  <div class="h-full w-full relative">
                    <!-- 垂直线 -->
                    <div
                      v-for="i in cols - 1"
                      :key="`v-${i}`"
                      class="border-l border-red-500/50 bottom-0 top-0 absolute"
                      :style="{ left: `${(i / cols) * 100}%` }"
                    />
                    <!-- 水平线 -->
                    <div
                      v-for="i in rows - 1"
                      :key="`h-${i}`"
                      class="border-t border-red-500/50 left-0 right-0 absolute"
                      :style="{ top: `${(i / rows) * 100}%` }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 裁剪结果 -->
          <div>
            <div mb-4 flex items-center justify-between>
              <h3 font-bold flex gap-2 items-center>
                <div i-carbon-grid />
                裁剪结果 ({{ croppedImages.length }} 张)
              </h3>
              <span text-xs text-gray-400 dark:text-gray-500>
                背景透明时显示棋盘格背景
              </span>
            </div>

            <div
              v-if="croppedImages.length > 0"
              class="p-1 border border-gray-200 rounded-lg bg-gray-100 gap-1 grid overflow-hidden dark:border-gray-700 dark:bg-gray-900"
              :style="{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }"
            >
              <div
                v-for="(img, idx) in croppedImages"
                :key="idx"
                class="bg-checkerboard group bg-white aspect-square cursor-pointer relative dark:bg-gray-800"
                title="点击下载这张图片"
                @click="handleDownloadSingle(img, idx)"
              >
                <img :src="img" class="h-full w-full object-contain">
                <div class="text-xs text-white bg-black/50 opacity-0 flex transition items-center inset-0 justify-center absolute group-hover:opacity-100">
                  <div flex flex-col items-center>
                    <div i-carbon-download text-xl mb-1 />
                    <span>#{{ idx + 1 }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="isProcessing" py-20 flex justify-center>
              <div text-primary animate-bounce>
                正在努力裁剪中... ✂️
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 自定义一下输入框样式，虽然用了 UnoCSS，但有些细节微调一下 */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  opacity: 1;
}

.input-base {
  width: 100%;
  --at-apply: box-border w-full min-w-0 focus: ring-primary/50 px-2 py-1.5 border border-gray-300 rounded-md
    focus: outline-none focus: ring-2 text-sm dark: bg-gray-800 dark: border-gray-600 dark: text-gray-200
    transition-colors shadow-sm;
}

.bg-checkerboard {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNmZmYiLz48cGF0aCBkPSJNMCAwSDRWNEgwem00IDhINFY0SDB6IiBmaWxsPSIjZWVlIi8+PC9zdmc+');
}

.dark .bg-checkerboard {
  background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMzMzMiLz48cGF0aCBkPSJNMCAwSDRWNEgwem00IDhINFY0SDB6IiBmaWxsPSIjNDQ0Ii8+PC9zdmc+');
}
</style>

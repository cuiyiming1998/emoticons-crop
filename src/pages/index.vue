<script setup lang="ts">
import { saveAs } from 'file-saver'
import JSZip from 'jszip'

defineOptions({
  name: 'IndexPage',
})

const fileInput = ref<HTMLInputElement | null>(null)
const imageUrl = ref('')
// 原始图片尺寸
const originalWidth = ref(0)
const originalHeight = ref(0)

// 基础配置
const rows = ref(4)
const cols = ref(6)

// 高级配置
const startX = ref(0)
const startY = ref(0)
const totalWidth = ref(0)
const totalHeight = ref(0)
const lockCenter = ref(true)
const paddingX = ref(0)
const paddingY = ref(0)
const showGrid = ref(true)

const croppedImages = ref<string[]>([])
const isProcessing = ref(false)

function triggerUpload() {
  fileInput.value?.click()
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    // 释放之前的 URL 对象，防止内存泄漏
    if (imageUrl.value) {
      URL.revokeObjectURL(imageUrl.value)
    }
    const url = URL.createObjectURL(file)

    // 获取图片尺寸并初始化配置
    const img = new Image()
    img.onload = () => {
      originalWidth.value = img.width
      originalHeight.value = img.height

      // 重置配置
      // 临时禁用锁定居中，防止初始化赋值时触发 watch 联动导致数值异常
      const wasLocked = lockCenter.value
      lockCenter.value = false

      startX.value = 0
      startY.value = 0
      totalWidth.value = img.width
      totalHeight.value = img.height
      paddingX.value = 0
      paddingY.value = 0

      // 恢复锁定状态
      nextTick(() => {
        lockCenter.value = wasLocked
      })

      imageUrl.value = url
    }
    img.src = url
  }
}

// 锁定居中逻辑
// 防止循环触发的标志位
const isInternalUpdate = ref(false)

watch(startX, (val, oldVal) => {
  if (isInternalUpdate.value)
    return

  if (lockCenter.value && imageUrl.value) {
    const diff = val - oldVal
    isInternalUpdate.value = true
    totalWidth.value -= diff * 2
    nextTick(() => {
      isInternalUpdate.value = false
    })
  }
})

watch(startY, (val, oldVal) => {
  if (isInternalUpdate.value)
    return

  if (lockCenter.value && imageUrl.value) {
    const diff = val - oldVal
    isInternalUpdate.value = true
    totalHeight.value -= diff * 2
    nextTick(() => {
      isInternalUpdate.value = false
    })
  }
})

watch(totalWidth, (val, oldVal) => {
  if (isInternalUpdate.value)
    return

  if (lockCenter.value && imageUrl.value) {
    const diff = val - oldVal
    isInternalUpdate.value = true
    startX.value -= diff / 2
    nextTick(() => {
      isInternalUpdate.value = false
    })
  }
})

watch(totalHeight, (val, oldVal) => {
  if (isInternalUpdate.value)
    return

  if (lockCenter.value && imageUrl.value) {
    const diff = val - oldVal
    isInternalUpdate.value = true
    startY.value -= diff / 2
    nextTick(() => {
      isInternalUpdate.value = false
    })
  }
})

async function doCrop() {
  if (!imageUrl.value)
    return

  isProcessing.value = true
  // 给一点时间让 UI 渲染 loading 状态
  await nextTick()

  const img = new Image()
  img.src = imageUrl.value
  img.onload = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      isProcessing.value = false
      return
    }

    // 计算单个格子的尺寸（基于总裁剪区域）
    const cellWidth = totalWidth.value / cols.value
    const cellHeight = totalHeight.value / rows.value

    const images: string[] = []

    for (let r = 0; r < rows.value; r++) {
      for (let c = 0; c < cols.value; c++) {
        // 计算源图像上的裁剪区域
        // 加上 padding (内缩)
        // 这里的 padding 是每个格子内部向内缩进的距离
        // 所以实际裁剪的起点要加上 paddingX/Y
        // 实际裁剪的宽高要减去 2 * paddingX/Y

        const srcX = startX.value + c * cellWidth + paddingX.value
        const srcY = startY.value + r * cellHeight + paddingY.value
        const srcW = cellWidth - 2 * paddingX.value
        const srcH = cellHeight - 2 * paddingY.value

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
  }

  img.onerror = () => {
    isProcessing.value = false
  }
}

async function downloadZip() {
  if (croppedImages.value.length === 0)
    return

  const zip = new JSZip()
  croppedImages.value.forEach((dataUrl, index) => {
    // data:image/png;base64,......
    const base64Data = dataUrl.split(',')[1]
    // 文件名格式: emoji_行_列.png (为了方便排序，可以用索引)
    // 或者直接用 emoji_01.png, emoji_02.png
    const fileName = `emoji_${(index + 1).toString().padStart(3, '0')}.png`
    zip.file(fileName, base64Data, { base64: true })
  })

  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, 'emojis.zip')
}

function downloadSingleImage(dataUrl: string, index: number) {
  const fileName = `emoji_${(index + 1).toString().padStart(3, '0')}.png`
  saveAs(dataUrl, fileName)
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
    doCrop()
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
          class="hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 p-6 text-center border-2 border-gray-300 rounded-xl border-dashed cursor-pointer transition dark:border-gray-700"
          @click="triggerUpload"
        >
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            hidden
            @change="onFileChange"
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
              @click="downloadZip"
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
                class="group bg-checkerboard bg-white aspect-square cursor-pointer relative dark:bg-gray-800"
                title="点击下载这张图片"
                @click="downloadSingleImage(img, idx)"
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

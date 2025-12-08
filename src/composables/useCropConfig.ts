import { nextTick, ref, watch } from 'vue'

export function useCropConfig() {
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
  const removeBackground = ref(true)
  const backgroundColor = ref('#FFFFFF')

  // 防止循环触发的标志位
  const isInternalUpdate = ref(false)

  function initConfig(imageWidth: number, imageHeight: number) {
    // 临时禁用锁定居中，防止初始化赋值时触发 watch 联动导致数值异常
    const wasLocked = lockCenter.value
    lockCenter.value = false

    startX.value = 0
    startY.value = 0
    totalWidth.value = imageWidth
    totalHeight.value = imageHeight
    paddingX.value = 0
    paddingY.value = 0

    // 恢复锁定状态
    nextTick(() => {
      lockCenter.value = wasLocked
    })
  }

  // 锁定居中逻辑
  watch(startX, (val, oldVal) => {
    if (isInternalUpdate.value)
      return

    if (lockCenter.value) {
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

    if (lockCenter.value) {
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

    if (lockCenter.value) {
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

    if (lockCenter.value) {
      const diff = val - oldVal
      isInternalUpdate.value = true
      startY.value -= diff / 2
      nextTick(() => {
        isInternalUpdate.value = false
      })
    }
  })

  return {
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
  }
}

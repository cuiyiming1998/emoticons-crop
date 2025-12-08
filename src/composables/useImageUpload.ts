import { onUnmounted, ref } from 'vue'

export function useImageUpload(fileInputRef: Ref<HTMLInputElement | null>) {
  const imageUrl = ref('')
  const originalWidth = ref(0)
  const originalHeight = ref(0)

  function triggerUpload() {
    fileInputRef.value?.click()
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
        imageUrl.value = url
      }
      img.src = url
    }
  }

  function resetImage() {
    if (imageUrl.value) {
      URL.revokeObjectURL(imageUrl.value)
    }
    imageUrl.value = ''
    originalWidth.value = 0
    originalHeight.value = 0
  }

  onUnmounted(() => {
    if (imageUrl.value) {
      URL.revokeObjectURL(imageUrl.value)
    }
  })

  return {
    fileInput: fileInputRef,
    imageUrl,
    originalWidth,
    originalHeight,
    triggerUpload,
    onFileChange,
    resetImage,
  }
}

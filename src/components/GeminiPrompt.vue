<script setup lang="ts">
// Gemini Prompt 组件，仅用于展示提示信息
const aiLocation = 'https://gemini.google.com/app'
const prompt = '将动漫角色后藤一里变形并设计24种LINE贴纸，姿势和排版要富有创意，对话为简体中文，不要有重复， 生成的图片为4k分辨率，比例为16:9，去除背景， 生成后的大图使用4 * 6的排版'
</script>

<template>
  <div class="bg-gradient-to-r dark:bg-gradient-to-r text-violet-700 p-4 border border-violet-200 rounded-xl flex gap-3 items-start from-violet-50/50 to-purple-50/50 dark:text-violet-300 dark:border-violet-800/30 dark:from-violet-950/30 dark:to-purple-950/30 dark:backdrop-blur-sm">
    <div class="i-carbon-idea text-xl text-violet-600 mt-0.5 shrink-0 dark:text-violet-400" />
    <div>
      <p class="font-bold mb-1">
        还没有满意的图片？试试用
        <a :href="aiLocation" target="_blank" class="text-violet-600 font-bold underline transition-colors dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300">
          Gemini 3
        </a>
        生成一个吧！
      </p>
      <p class="text-sm mb-2 opacity-90">
        1. 进入
        <a :href="aiLocation" target="_blank" class="text-violet-600 font-bold underline transition-colors dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300">
          Gemini
        </a>
        后，点击
        <span class="text-violet-600 font-semibold dark:text-violet-400">
          新对话
        </span>
        开始一个新的会话。
      </p>
      <p class="text-sm mb-2 opacity-90">
        2. 点击
        <span class="text-violet-600 font-semibold dark:text-violet-400">
          工具
        </span>
        , 选择
        <span class="text-violet-600 font-semibold dark:text-violet-400">
          🍌 生成图片
        </span>
        , 并选择思考模型。
      </p>
      <p class="text-sm mb-2 opacity-90">
        3. 输入提示词。下面是一段示例:
      </p>
      <div class="bg-gradient-to-r text-xs font-mono p-3 text-left border border-violet-200/50 rounded-lg select-all from-violet-100/30 to-purple-100/30 dark:text-violet-200 dark:border-violet-700/50 dark:from-violet-900/20 dark:to-purple-900/20">
        {{ prompt }}
      </div>
    </div>
  </div>
</template>

# 🎨 表情包裁剪工具

<div align="center">
  <img src="https://i.mji.rip/2025/12/08/09637ea75032c695466faa6868dea858.png" alt="表情包裁剪工具界面截图" width="200">
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Vue-3.5-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue 3.5">
  <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License">
</div>

## 📖 简介

一个超级可爱的表情包裁剪工具！上传大图，自动切割成网格布局，支持背景去除和多种自定义设置，一键打包下载所有裁剪结果~ (≧∇≦)ﾉ

## ✨ 主要特性

- 🖼️ **智能裁剪** - 自动将大图切割成自定义网格
- 🎨 **背景去除** - 智能移除指定颜色背景，支持取色器
- 📐 **精确控制** - 支持位置、尺寸、内缩微调
- 🌙 **深色模式** - 完美的暗色主题支持
- 📱 **响应式设计** - 适配各种屏幕尺寸
- ⚡ **实时预览** - 即时查看裁剪效果
- 🎯 **锁定居中** - 一键居中对齐裁剪区域
- 📦 **批量下载** - 支持 ZIP 打包和单独下载
- 🤖 **AI 生成提示** - 集成 Gemini AI 图片生成指南

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- pnpm (推荐)

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/cuiyiming1998/emoticons-crop.git
cd emoticons-crop

# 安装依赖
pnpm install
```

### 开发

```bash
# 启动开发服务器
pnpm dev
```

### 构建

```bash
# 构建生产版本
pnpm build
```

### 预览

```bash
# 预览生产构建
pnpm preview
```

## 🎮 使用指南

### 基础使用

1. **上传图片** - 点击上传区域选择图片，支持 JPG、PNG 格式
2. **设置网格** - 调整行数和列数（1-20）
3. **微调区域** - 使用区域微调工具精确调整裁剪范围
4. **裁剪下载** - 点击"打包下载"获取所有裁剪结果

### 高级功能

#### 背景去除

- 开启"启用背景去除"开关
- 使用取色器从图片中选取要移除的背景色
- 或手动输入十六进制颜色值

#### 区域微调

- **X (Left)** - 左边距调整
- **Y (Top)** - 上边距调整
- **Width** - 裁剪区域宽度
- **Height** - 裁剪区域高度
- **锁定居中** - 自动居中对齐裁剪区域

#### 边缘内缩

- **横向 (X)** - 水平方向内缩距离 (0-50px)
- **纵向 (Y)** - 垂直方向内缩距离 (0-50px)

## 🛠️ 技术栈

- **前端框架**: Vue 3.5
- **类型系统**: TypeScript
- **样式框架**: Tailwind CSS
- **构建工具**: Vite
- **图片处理**: Canvas API
- **状态管理**: Vue Composition API

## 📁 项目结构

```
src/
├── components/          # 组件
│   └── GeminiPrompt.vue # AI 生成提示组件
├── composables/         # 组合式函数
│   ├── useCropConfig.ts # 裁剪配置管理
│   ├── useDownload.ts   # 下载功能
│   ├── useImageCropper.ts # 图片裁剪
│   └── useImageUpload.ts # 图片上传
├── pages/
│   └── index.vue        # 主页面
└── assets/              # 静态资源
```

## 🔧 自定义配置

### 主题颜色

在 `tailwind.config.js` 中自定义主题：

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        // ...
      }
    }
  }
}
```

### 裁剪参数

修改 `useCropConfig.ts` 调整默认参数：

```typescript
const defaultConfig = {
  rows: 4,
  cols: 6,
  maxRows: 20,
  maxCols: 20,
  // ...
}
```

---

<div align="center">
  <p>Made with ❤️ and Vue.js</p>
  <p>如果觉得有用，请给个 ⭐ Star 支持一下哦~</p>
</div>

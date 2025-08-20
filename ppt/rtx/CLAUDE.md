# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个NVIDIA RTX GPU产品演示和技术培训的HTML演示文稿仓库，主要包含：

- RTX系列显卡产品对比演示页面
- GPU技术培训材料和实践指南
- 网络架构和集群配置教程
- 产品规格文档和PDF资料

## 主要目录结构

```
rtx/                    # RTX系列产品对比演示
├── rtx5000vs.html     # RTX 5000系列对比
├── rtx4000vs.html     # RTX 4000系列对比
├── rtx6000vs.html     # RTX 6000系列对比
├── rtxpro6000.html    # RTX Pro 6000演示
└── *.pdf              # 产品规格文档

training/              # GPU技术培训内容
├── index*.html        # 培训演示页面（34个章节）
├── gpu.md             # GPU服务器集群配置指南
├── practical/         # 实践练习
└── *.png              # 技术架构图

templates/             # 可重用演示模板
├── covers/            # 封面模板
├── technical/         # 技术内容模板
└── products/          # 产品演示模板
```

## 开发规范

### HTML演示文稿设计原则

1. **响应式设计**：所有演示页面使用viewport适配，支持16:9演示比例
2. **中文界面**：所有内容使用简体中文，字体使用'Noto Sans SC'
3. **NVIDIA品牌风格**：统一使用深色背景和绿色(#76b900)主题色
4. **动画效果**：内置CSS动画和JavaScript交互效果

### 样式约定

- 主背景：渐变深色 `linear-gradient(135deg, #0c1015 0%, #1a2332 40%, #0f1419 100%)`
- 主题色：NVIDIA绿 `#76b900`
- 辅助色：青绿色 `#10b981` 
- 字体：'Noto Sans SC', sans-serif
- 布局：flex布局，16:9比例容器

### 技术培训内容规范

1. **GPU服务器配置**：包含BIOS、驱动、CUDA Toolkit完整安装指南
2. **性能测试**：使用NCCL测试多GPU通信性能
3. **系统优化**：包含功耗管理、CPU亲和性等高级配置

## 常用开发任务

### 创建新的产品对比页面

1. 复制现有的产品对比文件（如rtx5000vs.html）作为模板
2. 修改页面标题和产品名称
3. 更新产品规格表格数据
4. 调整分析内容和建议

### 添加新的培训章节

1. 在training目录下创建新的index{n}.html文件
2. 保持与现有页面一致的样式和结构
3. 如需要，在practical目录下添加对应的实践材料

### 修改产品规格表格

- 表格使用`.comparison-table`类
- 最佳性能项使用`.highlight-best`类标记
- 重要数值使用`.highlight-value`类突出显示

## 静态资源管理

- PDF文档：产品规格表和技术文档
- 图片资源：主要为PNG格式的技术架构图
- 所有资源采用相对路径引用

## 浏览器兼容性

- 支持现代浏览器的CSS Grid和Flexbox
- 使用Google Fonts在线字体
- CSS3动画和变换效果
- JavaScript ES6+语法
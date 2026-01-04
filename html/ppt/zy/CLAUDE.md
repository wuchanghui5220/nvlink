# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个HTML演示文稿项目，用于展示北京正阳恒卓科技有限公司的企业简介。项目包含多个HTML文件，每个文件都是不同设计风格的公司介绍页面。

## 代码库结构

- `index1.html` - 主要公司介绍页面，采用绿色渐变背景，居中布局设计
- `index2.html` - 双栏式设计，左侧公司信息，右侧内容展示
- `index3.html` - 封面页设计，包含公司标语和合作伙伴信息
- `index4.html` - 替代设计方案，左右分栏布局
- `index5.html` - 简化版设计，包含SVG logo图标
- `projects_case.txt` - 公司项目案例文档
- `zy_elite.png` - 公司相关图片资源

## 设计特点

所有HTML页面都使用：
- 响应式设计，支持不同屏幕尺寸
- CSS Grid和Flexbox布局
- 绿色主题色调（#76a67e, #3e703e等）
- 中文字体支持和优化
- 装饰性元素和视觉效果

## 公司信息

- 公司名称：北京正阳恒卓科技有限公司 / Beijing Zhengyang Hengzhuo Technology Co., Ltd.
- 成立时间：2015年
- 主营业务：AI解决方案、高性能计算、数据中心网络优化
- 合作伙伴：NVIDIA networking精英级合作伙伴、compute注册级合作伙伴

## 开发建议

- 所有文本内容都是中文，新增内容应保持中文
- 保持现有的绿色主题色调一致性
- 图片路径使用placeholder格式（/api/placeholder/宽度/高度）
- 响应式断点设置为1200px
- CSS采用内联样式，便于单文件部署
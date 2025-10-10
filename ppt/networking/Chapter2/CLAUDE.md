# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# Chapter2: IB网络拓扑规划 - 培训子模块

## 项目概述
本目录是 **NVIDIA Networking 基础培训** 项目的第二章节,专注于 **InfiniBand 网络拓扑规划** 的培训内容。

### 与父项目的关系
- **继承设计规范**: 完全遵循父目录 `/home/admin/ibtc/html/ppt/networking/CLAUDE.md` 的所有设计标准
- **独立章节导航**: 本章节有独立的页面导航系统,仅管理 Chapter2 内的页面跳转
- **模块化开发**: 独立子目录开发,避免影响父目录性能

## 设计规范继承

### 视觉设计(继承自父项目)
- **配色主题**: 蓝绿渐变配色方案
  - 蓝色系: #3b82f6, #1e40af (代表网络技术)
  - 绿色系: #22c55e, #76b900 (代表 GPU 技术)
- **LOGO**: NVIDIA 官方 SVG LOGO (30px-40px) + ZYHZ LOGO (200x200px 蓝绿渐变)
- **紧凑型页眉**: Logo + 标题/副标题 + 面包屑导航
- **装饰元素**:
  - 右上角: 圆点网格 (3x3 渐隐)
  - 左下角: 旋转几何方框组合
- **字体系统**: Inter 字体家族
- **动画效果**: fadeInUp, 0.6s ease
- **专业设计**: 不使用 emoji 图标,使用 border-bottom 装饰线

### 布局规范(继承自父项目)
- PPT 标准布局: 紧凑页眉 + 主体内容 + 底部信息
- 双栏或多栏内容区域(支持独立滚动)
- 核心优势总结区域(3列布局)
- 底部信息: 讲师 + 页码
- 导航控制: 返回目录 + 下一页/上一页

### 导航功能(继承自父项目)
- **键盘导航**: 左右箭头键、ESC 返回、数字键快速跳转
- **鼠标导航**: 按钮点击、卡片点击
- **面包屑导航**: 返回上级页面
- **页面跳转**: 使用 `window.location.href`

## Chapter2 特有内容

### 章节主题
**IB网络拓扑规划** - 涵盖 InfiniBand 网络从简单到复杂的拓扑结构设计

### 内容板块(基于 chapter2.md)
1. **单机直连配置** (direct-connect.html)
   - 概念与优势
   - 配置要点(硬件、子网管理器、网络配置)

2. **多机集群拓扑设计** (fat-tree.html)
   - 胖树(Fat-Tree)拓扑简介
   - 设计原则与考量(收敛比、交换机端口分配、规模规划)

3. **冗余与高可用性方案** (redundancy.html)
   - 多路径冗余
   - 双交换机冗余拓扑
   - 子网管理器(SM)冗余
   - 电源与风扇冗余

### 文件结构
```
Chapter2/
├── CLAUDE.md              # 本文档(章节开发指南)
├── chapter2.md            # 内容源文档(Markdown格式)
├── index.html             # 章节导航页(Chapter2主页)
├── direct-connect.html    # 单机直连配置页面
├── fat-tree.html          # 胖树拓扑设计页面
└── redundancy.html        # 冗余与高可用性页面
```

### 导航系统设计
Chapter2 的导航系统采用 **闭环设计**:
- **index.html**: 章节导航页,展示3个子板块卡片
- **各子页面**: 可通过箭头键或按钮在子页面间切换
- **返回上级**: ESC 或左上角面包屑导航返回父目录的 `catalog.html`
- **页码显示**: 格式为 `2-1 / 2-3` (章节号-页码 / 章节号-总页数)

### 面包屑导航路径
```
首页 → 目录 → Chapter2 → 子页面
index.html → catalog.html → Chapter2/index.html → Chapter2/[page].html
```

## 开发规范

### 页面模板结构(Chapter2 专用)
```html
<!-- 页眉 -->
<header class="slide-header">
  <div class="nvidia-logo">NVIDIA SVG</div>
  <div class="title-area">
    <h1>IB网络拓扑规划</h1>
    <p class="subtitle">第二章: [具体小节标题]</p>
  </div>
  <nav class="breadcrumb">
    首页 → 目录 → 第二章 → [当前页]
  </nav>
</header>

<!-- 主体内容 -->
<main class="main-content">
  <!-- 内容区域,根据页面特点使用双栏或多栏布局 -->
</main>

<!-- 底部 -->
<footer class="slide-footer">
  <div class="presenter-info">
    <div class="presenter-name">Vincent / CTO</div>
    <div class="presenter-title">吴昌辉</div>
  </div>
  <div class="slide-number">2-[N] / 2-3</div>
</footer>

<!-- 导航控制 -->
<div class="navigation-controls">
  <button onclick="prevPage()">← 上一页</button>
  <button onclick="nextPage()">下一页 →</button>
</div>
```

### 内容组织原则
1. **简洁清晰**: 避免技术细节堆砌,适合基础培训
2. **可视化**: 尽可能使用图表、流程图说明拓扑结构
3. **分层展示**: 从简单到复杂,循序渐进
4. **实用导向**: 突出配置要点和最佳实践

### 响应式设计
- 大屏(>1200px): 双栏或多栏布局
- 中屏(768px-1200px): 2列或单列布局
- 小屏(<768px): 单列垂直布局

## 开发流程

### 典型开发步骤
1. **分析 chapter2.md**: 理解内容结构和关键要点
2. **设计页面布局**: 根据内容选择合适的网格布局(1列/2列/3列)
3. **编写 HTML**: 遵循模板结构,保持设计一致性
4. **添加导航**: 配置页面间的跳转逻辑
5. **测试交互**: 验证键盘导航、鼠标点击、面包屑返回等功能
6. **内容优化**: 确保滚动区域不溢出,字体大小合适

### 注意事项
- **不使用 emoji**: 保持专业商务风格
- **统一配色**: 严格使用蓝绿渐变色系
- **路径正确**: 返回父目录使用 `../catalog.html`
- **页码格式**: 统一使用 `2-N / 2-总数` 格式
- **ZYHZ LOGO**: 使用 200x200px 尺寸,应用蓝绿渐变填充

## 技术实现要点

### 子网管理器代码示例
在"单机直连配置"页面可能需要展示配置命令:
```bash
# 启动 OpenSM (子网管理器)
sudo systemctl start opensmd

# 配置 IPoIB 网络接口
sudo ip addr add 192.168.1.1/24 dev ib0
```

### 胖树拓扑可视化
在"胖树拓扑设计"页面建议使用:
- CSS Grid 布局模拟网络层级结构
- 使用渐变色区分 Spine 层和 Leaf 层
- 连接线使用 SVG 或 CSS border 实现

### 冗余方案图示
在"冗余与高可用性"页面建议:
- 双交换机拓扑使用对比卡片布局
- 主备模式 vs 负载均衡模式使用左右分栏展示

## 参考资源
- 父项目 CLAUDE.md: `/home/admin/ibtc/html/ppt/networking/CLAUDE.md`
- 内容源文档: `./chapter2.md`
- 父项目首页模板: `../index.html`
- 父项目目录页: `../catalog.html`

---

**章节负责人**: Vincent (CTO / 吴昌辉)
**创建时间**: 2025-10-10
**父项目**: NVIDIA Networking 基础培训
**章节编号**: Chapter 2 of 7
**页面数量**: 3-4 页 (导航页 + 3个主题页)

# 实现计划：ForJiaXue - 浪漫互动网页

**分支**: `001-romantic-interactive-webpage` | **日期**: 2026-07-06 | **规范**: [spec.md](./spec.md)

**输入**: 功能规范来自 `/specs/001-romantic-interactive-webpage/spec.md`

## 概要

为喜欢的人构建浪漫互动网页体验。功能包括：带花瓣动画和可选密码的入口屏幕、60k/30k/12k分层系统的照片粒子聚合、带音乐驱动效果的3D圆柱照片墙、手势解锁（MediaPipe）、以及带打字机祝福文字的结局。后端提供照片/音乐上传、EXIF移除、WebP转换、粒子图生成、访客统计（哈希IP）、秘密消息功能。移动优先垂直滚动导航，性能自动检测。

## 技术背景

**语言/版本**: TypeScript 5.x (前端), Python 3.11 (后端)

**主要依赖**: 
- 前端: Next.js 14+, React 18+, React Three Fiber, Three.js, GSAP, Framer Motion, Zustand, Web Audio API, MediaPipe Hand Landmarker
- 后端: FastAPI, SQLite, SQLAlchemy 2.0+, Pillow, OpenCV

**存储**: SQLite 位于 `backend/data/app.db`，uploads目录结构：`original/`, `webp/`, `thumb/`, `music/`, `particle_map/`

**测试**: Jest (前端单元), Playwright (E2E), pytest (后端)

**目标平台**: 现代浏览器（WebGL, Web Audio API支持），移动优先（iPhone 16 Pro Max作为高端参考），自动适配低性能设备

**项目类型**: Web应用（前端 + 后端）

**性能目标**: 
- 高/中分层粒子动画60fps
- 低分层最低45fps
- 照片聚合5-8秒
- 完整体验<3分钟
- 音乐连续播放

**约束**: 
- 照片: jpg/jpeg/png/webp, 最大10MB
- 音乐: mp3/m4a/wav, 最大20MB
- 必须移除EXIF
- IP仅哈希存储（不存原始IP）
- 低性能时自动禁用Bloom

**规模/范围**: 
- 1张主照片 + 6-12张照片墙照片
- 1条活跃音乐
- 单管理员用户
- 个人使用（低流量，估计~100访问/月）

## Constitution检查

*GATE: 必须在Phase 0研究前通过。Phase 1设计后重新检查。*

Constitution文件是模板（未填写）。无治理约束适用。按标准开发实践继续。

## 项目结构

### 文档（本功能）

```text
specs/001-romantic-interactive-webpage/
├── spec.md              # 功能规范
├── plan.md              # 本文件
├── research.md          # 技术决策
├── data-model.md        # 实体定义
├── quickstart.md        # 验证指南
├── contracts/
│   └── api.md           # REST API契约
└── tasks.md             # (由 /speckit-tasks 生成)
```

### 源代码（仓库根目录）

```text
frontend/
├── src/
│   ├── app/                 # Next.js App Router路由
│   │   ├── layout.tsx       # 根布局
│   │   ├── page.tsx         # 首页（重定向）
│   │   └── ForJiaXue/       # 主体验页面
│   │   │   ├── page.tsx     # 体验入口点
│   │   │   └── components/  # 屏幕组件
│   │   └── admin/           # 管理后台（可选前端）
│   ├── components/
│   │   ├── entry/           # 入口屏幕 + 花瓣
│   │   ├── particles/       # 粒子聚合场景
│   │   ├── photo-wall/      # 3D圆柱墙
│   │   ├── unlock/          # 手势识别屏幕
│   │   ├── finale/          # 祝福 + 动画
│   │   └── ui/              # 共享UI元素
│   ├── three/
│   │   ├── shaders/         # GLSL shader文件
│   │   ├── geometry/        # 粒子几何工具
│   │   ├── particle-engine/ # 核心粒子系统
│   │   └── r3f-utils/       # R3F助手
│   ├── hooks/
│   │   ├── useAudio.ts      # Web Audio API hook
│   │   ├── useGesture.ts    # MediaPipe hook
│   │   ├── useScroll.ts     # GSAP ScrollTrigger
│   │   └── usePerformance.ts # 设备检测
│   ├── stores/
│   │   ├── audioStore.ts    # 音频状态
│   │   ├── screenStore.ts   # 屏幕进展
│   │   ├── gestureStore.ts  # 手势状态
│   │   └── configStore.ts   # 应用配置
│   ├── lib/
│   │   ├── api-client.ts    # 后端API调用
│   │   ├── performance.ts   # 分层检测
│   │   └── particle-utils.ts # 粒子助手
│   └── styles/
│   │   └── globals.css      # 全局样式
│   └── public/
│   │   └── assets/          # 静态资源（花瓣SVG等）
│   └── types/
│   │   └── index.ts         # TypeScript类型
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js       # Tailwind CSS
└── .env.local               # 环境配置

backend/
├── app/
│   ├── main.py              # FastAPI应用入口
│   ├── database.py          # SQLite + SQLAlchemy设置
│   ├── config.py            # 环境设置
│   ├── models/
│   │   ├── photo.py         # Photo SQLAlchemy模型
│   │   ├── music.py         # MusicTrack模型
│   │   ├── blessing.py      # BlessingText模型
│   │   ├── visit.py         # VisitEvent模型
│   │   ├── message.py       # SecretMessage模型
│   │   └── config.py        # AppConfig模型
│   ├── schemas/
│   │   ├── photo.py         # Pydantic schemas
│   │   ├── music.py
│   │   ├── blessing.py
│   │   ├── visit.py
│   │   ├── message.py
│   │   └── config.py
│   ├── api/
│   │   ├── photos.py        # 照片端点
│   │   ├── music.py         # 音乐端点
│   │   ├── config.py        # 配置端点
│   │   ├── stats.py         # 统计端点
│   │   ├── messages.py      # 秘密消息
│   │   ├── blessing.py      # 祝福文字
│   │   └── admin.py         # 管理认证
│   ├── services/
│   │   ├── image_processor.py # EXIF, WebP, 缩略图
│   │   ├── particle_map.py    # 粒子位置生成
│   │   ├── stats.py           # 统计聚合
│   │   └── auth.py            # 密码哈希
│   └── core/
│   │   ├── security.py      # 认证工具
│   │   └── config.py        # 设置
├── data/
│   └── app.db               # SQLite数据库
├── uploads/
│   ├── original/            # 原始照片
│   ├── webp/                # 处理后WebP
│   ├── thumb/               # 缩略图
│   ├── music/               # 音乐文件
│   └── particle_map/        # 粒子JSON图
├── requirements.txt
├── alembic.ini              # 迁移配置
└── .env                     # 环境 (ADMIN_PASSWORD)

references/
├── particular-drift/        # 粒子系统参考
└── interactive-particles/   # Shader交互参考

.claude/
├── skills/                  # Claude Code skills
└── settings.json            # Claude设置

.specify/
├── templates/               # Spec Kit模板
├── scripts/                 # PowerShell脚本
└── memory/
│   └── constitution.md      # (模板，未填写)
```

**结构决策**: 选项2（Web应用）前后端分离。前端使用Next.js App Router配合React Three Fiber实现3D。后端使用FastAPI配合SQLAlchemy。Uploads和数据库存储在后端目录，需要持久化文件系统（推荐VPS部署）。

## 复杂度追踪

无constitution违规。标准Web应用复杂度适合功能需求。
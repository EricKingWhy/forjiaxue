# 任务列表：ForJiaXue - 浪漫互动网页

**输入**: 设计文档来自 `/specs/001-romantic-interactive-webpage/`

**前置条件**: plan.md (必填), spec.md (必填), data-model.md, contracts/api.md, research.md

**组织**: 任务按实现阶段组织：骨架 → 后端 → 前端静态流程 → 粒子视觉 → 音乐同步 → 手势 → 部署

**格式**: `[ID] [P?] 描述 | 文件 | 验证`

---

## Phase 1: 项目骨架搭建

**目的**: 初始化前端和后端项目结构

### 前端骨架

- [x] T001 [P] 在 `frontend/` 创建 Next.js 14 项目（TypeScript）
  - **文件**: `frontend/package.json`, `frontend/tsconfig.json`, `frontend/next.config.js`
  - **标准**: `npm run dev` 在 localhost:3000 启动
  - **验证**: `cd frontend && npm run dev`

- [x] T002 [P] 配置 Tailwind CSS 样式
  - **文件**: `frontend/tailwind.config.js`, `frontend/src/styles/globals.css`
  - **标准**: Tailwind 类在组件中工作
  - **验证**: 在 page.tsx 添加测试类，检查视觉输出

- [x] T003 [P] 按 plan.md 创建前端目录结构
  - **文件**: `frontend/src/app/`, `frontend/src/components/`, `frontend/src/three/`, `frontend/src/hooks/`, `frontend/src/stores/`, `frontend/src/lib/`, `frontend/src/types/`
  - **标准**: 所有目录存在并有占位索引文件
  - **验证**: `ls frontend/src/`

- [x] T004 [P] 安装 React Three Fiber 依赖
  - **文件**: `frontend/package.json`
  - **标准**: @react-three/fiber, @react-three/drei, three 已安装
  - **验证**: `cd frontend && npm list @react-three/fiber`

- [x] T005 [P] 安装 GSAP 和 Framer Motion
  - **文件**: `frontend/package.json`
  - **标准**: gsap, framer-motion 已安装
  - **验证**: `cd frontend && npm list gsap framer-motion`

- [x] T006 [P] 安装 Zustand 状态管理
  - **文件**: `frontend/package.json`, `frontend/src/stores/index.ts`
  - **标准**: zustand 已安装，占位 store 已创建
  - **验证**: `cd frontend && npm list zustand`

- [x] T007 创建根布局和首页重定向
  - **文件**: `frontend/src/app/layout.tsx`, `frontend/src/app/page.tsx`
  - **标准**: 根布局渲染，首页重定向到 /ForJiaXue
  - **验证**: `curl localhost:3000` 重定向

### 后端骨架

- [x] T008 [P] 在 `backend/` 创建 Python 项目结构
  - **文件**: `backend/requirements.txt`, `backend/.env.example`
  - **标准**: 目录结构存在
  - **验证**: `ls backend/`

- [x] T009 [P] 安装 FastAPI 和依赖
  - **文件**: `backend/requirements.txt`
  - **标准**: fastapi, uvicorn, sqlalchemy, pillow, opencv-python 已安装
  - **验证**: `cd backend && pip list | grep fastapi`

- [x] T010 创建 uploads 目录结构
  - **文件**: `backend/uploads/original/`, `backend/uploads/webp/`, `backend/uploads/thumb/`, `backend/uploads/music/`, `backend/uploads/particle_map/`, `backend/data/`
  - **标准**: 所有上传子目录存在
  - **验证**: `ls backend/uploads/`

- [x] T011 创建 .gitignore 排除 uploads 和 data
  - **文件**: `.gitignore`
  - **标准**: uploads/, data/, .env 被忽略
  - **验证**: `git status --ignored`

**检查点**: 骨架完成，两个项目可初始化

---

## Phase 2: 后端核心

**目的**: 构建后端 API，所有端点独立可测试

### 健康检查

- [x] T012 创建 FastAPI 应用入口和健康端点
  - **文件**: `backend/app/main.py`, `backend/app/config.py`
  - **标准**: GET /api/health 返回 {"status": "ok"}
  - **验证**: `curl localhost:8000/api/health`

### 数据库设置

- [x] T013 创建 SQLite 数据库配置
  - **文件**: `backend/app/database.py`
  - **标准**: 数据库文件创建于 backend/data/app.db
  - **验证**: `ls backend/data/app.db`

- [x] T014 创建 SQLAlchemy base 和 session 管理
  - **文件**: `backend/app/database.py`
  - **标准**: Session 可创建和关闭
  - **验证**: Python 测试脚本成功创建 session

### 模型（细粒度）

- [x] T015 [P] 创建 Photo 模型
  - **文件**: `backend/app/models/photo.py`
  - **标准**: Photo 表按 data-model.md 创建所有字段
  - **验证**: SQLite 检查器显示 photo 表

- [x] T016 [P] 创建 MusicTrack 模型
  - **文件**: `backend/app/models/music.py`
  - **标准**: MusicTrack 表创建所有字段
  - **验证**: SQLite 检查器显示 music_track 表

- [x] T017 [P] 创建 BlessingText 模型
  - **文件**: `backend/app/models/blessing.py`
  - **标准**: BlessingText 表创建 paragraphs JSON 字段
  - **验证**: SQLite 检查器显示 blessing_text 表

- [x] T018 [P] 创建 VisitEvent 模型
  - **文件**: `backend/app/models/visit.py`
  - **标准**: VisitEvent 表创建 ip_hash, screens_completed 字段
  - **验证**: SQLite 检查器显示 visit_event 表

- [x] T019 [P] 创建 SecretMessage 模型
  - **文件**: `backend/app/models/message.py`
  - **标准**: SecretMessage 表创建 is_read 字段
  - **验证**: SQLite 检查器显示 secret_message 表

- [x] T020 [P] 创建 AppConfig 模型
  - **文件**: `backend/app/models/config.py`
  - **标准**: AppConfig 表作为单例创建 (id=1)
  - **验证**: SQLite 检查器显示 app_config 表

- [x] T021 初始化 AppConfig 单例默认值
  - **文件**: `backend/app/database.py` 或 seed 脚本
  - **标准**: AppConfig 行存在 id=1，默认值已设置
  - **验证**: `curl localhost:8000/api/config`

- [x] T022 初始化默认 BlessingText 占位内容
  - **文件**: `backend/app/database.py` 或 seed 脚本
  - **标准**: BlessingText 行存在占位 paragraphs
  - **验证**: `curl localhost:8000/api/blessing`

### Pydantic Schemas

- [x] T023 [P] 创建 Photo schemas（请求/响应）
  - **文件**: `backend/app/schemas/photo.py`
  - **标准**: PhotoResponse, PhotoUploadRequest 已定义
  - **验证**: 导入 schemas 无错误

- [x] T024 [P] 创建 Music schemas
  - **文件**: `backend/app/schemas/music.py`
  - **标准**: MusicResponse 已定义
  - **验证**: 导入 schemas 无错误

- [x] T025 [P] 创建 Blessing schemas
  - **文件**: `backend/app/schemas/blessing.py`
  - **标准**: BlessingResponse, BlessingUpdate 已定义
  - **验证**: 导入 schemas 无错误

- [x] T026 [P] 创建 VisitEvent schemas
  - **文件**: `backend/app/schemas/visit.py`
  - **标准**: VisitEnterRequest, VisitExitRequest 已定义
  - **验证**: 导入 schemas 无错误

- [x] T027 [P] 创建 Message schemas
  - **文件**: `backend/app/schemas/message.py`
  - **标准**: MessageCreate, MessageResponse 已定义
  - **验证**: 导入 schemas 无错误

- [x] T028 [P] 创建 Config schemas
  - **文件**: `backend/app/schemas/config.py`
  - **标准**: ConfigResponse, ConfigUpdate, PasswordVerify 已定义
  - **验证**: 导入 schemas 无错误

### 公开 API 端点

- [x] T029 创建 GET /api/photos 端点
  - **文件**: `backend/app/api/photos.py`, `backend/app/main.py`
  - **标准**: 返回 main_photo 和 wall_photos 数组
  - **验证**: `curl localhost:8000/api/photos`

- [x] T030 创建 GET /api/music 端点
  - **文件**: `backend/app/api/music.py`, `backend/app/main.py`
  - **标准**: 返回活跃音乐轨道 URL
  - **验证**: `curl localhost:8000/api/music`

- [x] T031 创建 GET /api/config 端点
  - **文件**: `backend/app/api/config.py`, `backend/app/main.py`
  - **标准**: 返回 visitor_password_enabled, particle_tier_default 等
  - **验证**: `curl localhost:8000/api/config`

- [x] T032 创建 POST /api/config/verify-password 端点
  - **文件**: `backend/app/api/config.py`, `backend/app/services/auth.py`
  - **标准**: 返回 {valid: true/false} 密码检查结果
  - **验证**: `curl -X POST localhost:8000/api/config/verify-password -d '{"password":"test"}'`

- [x] T033 创建 GET /api/blessing 端点
  - **文件**: `backend/app/api/blessing.py`, `backend/app/main.py`
  - **标准**: 返回 paragraphs 数组用于打字机效果
  - **验证**: `curl localhost:8000/api/blessing`

- [x] T034 创建 POST /api/messages 端点（秘密消息）
  - **文件**: `backend/app/api/messages.py`, `backend/app/main.py`
  - **标准**: 创建 SecretMessage，返回 id 和 timestamp
  - **验证**: `curl -X POST localhost:8000/api/messages -d '{"content":"test"}'`

- [x] T035 创建 POST /api/stats/visit 端点（进入动作）
  - **文件**: `backend/app/api/stats.py`, `backend/app/main.py`
  - **标准**: 创建 VisitEvent 包含 ip_hash, device_type
  - **验证**: `curl -X POST localhost:8000/api/stats/visit -d '{"ip_hash":"abc","device_type":"mobile","action":"enter"}'`

- [x] T036 创建 POST /api/stats/visit 端点（退出动作）
  - **文件**: `backend/app/api/stats.py`
  - **标准**: 更新 VisitEvent 包含 screens_completed, duration
  - **验证**: `curl -X POST localhost:8000/api/stats/visit -d '{"ip_hash":"abc","action":"exit","screens_completed":["entry"]}'`

### 管理员认证

- [x] T037 创建密码哈希服务
  - **文件**: `backend/app/services/auth.py`, `backend/app/core/security.py`
  - **标准**: SHA-256 哈希函数工作，ADMIN_PASSWORD 验证
  - **验证**: Python 测试脚本哈希并验证密码

- [x] T038 创建 POST /api/admin/auth 端点
  - **文件**: `backend/app/api/admin.py`, `backend/app/main.py`
  - **标准**: 正确 ADMIN_PASSWORD 返回 JWT token
  - **验证**: `curl -X POST localhost:8000/api/admin/auth -d '{"password":"admin123"}'`

### 管理员端点

- [x] T039 创建 GET /api/admin/stats 端点
  - **文件**: `backend/app/api/stats.py`, `backend/app/services/stats.py`
  - **标准**: 返回 total_visits, device_breakdown, recent_visits
  - **验证**: `curl -H "Authorization: Bearer <token>" localhost:8000/api/admin/stats`

- [x] T040 创建 GET /api/admin/messages 端点
  - **文件**: `backend/app/api/messages.py`
  - **标准**: 返回 messages 数组包含 unread_count
  - **验证**: `curl -H "Authorization: Bearer <token>" localhost:8000/api/admin/messages`

- [x] T041 创建 PATCH /api/admin/messages/{id} 端点
  - **文件**: `backend/app/api/messages.py`
  - **标准**: 更新 is_read 状态
  - **验证**: `curl -X PATCH -H "Authorization: Bearer <token>" localhost:8000/api/admin/messages/1 -d '{"is_read":true}'`

### 照片上传处理（细粒度）

- [x] T042 创建文件验证服务（格式、大小）
  - **文件**: `backend/app/services/image_processor.py`
  - **标准**: 验证 jpg/jpeg/png/webp ≤10MB, mp3/m4a/wav ≤20MB
  - **验证**: Python 测试脚本验证有效/无效文件

- [x] T043 创建 EXIF 移除函数
  - **文件**: `backend/app/services/image_processor.py`
  - **标准**: EXIF 数据完全从图像移除
  - **验证**: 处理测试图像，检查输出无 EXIF

- [x] T044 创建 WebP 转换函数（质量 85）
  - **文件**: `backend/app/services/image_processor.py`
  - **标准**: 图像转换为质量 85 的 WebP
  - **验证**: 处理测试图像，输出为 WebP 格式

- [x] T045 创建缩略图生成函数（高度 300px）
  - **文件**: `backend/app/services/image_processor.py`
  - **标准**: 缩略图高度 300px，宽度等比例
  - **验证**: 处理测试图像，缩略图尺寸正确

- [x] T046 创建粒子图生成函数
  - **文件**: `backend/app/services/particle_map.py`
  - **标准**: 生成 {x, y, color} 位置的 JSON 数组
  - **验证**: 处理测试图像，输出 JSON 结构正确

- [x] T047 创建完整照片处理流水线
  - **文件**: `backend/app/services/image_processor.py`
  - **标准**: 组合：EXIF → WebP → Thumb → ParticleMap
  - **验证**: 上传测试照片，所有输出已生成

- [x] T048 创建 POST /api/admin/photos 上传端点
  - **文件**: `backend/app/api/photos.py`
  - **标准**: 接收 multipart 文件，处理，保存到 DB 和 uploads/
  - **验证**: `curl -X POST -F "file=@test.jpg" localhost:8000/api/admin/photos`

- [x] T049 创建 DELETE /api/admin/photos/{id} 端点
  - **文件**: `backend/app/api/photos.py`
  - **标准**: 照片从 DB 删除，文件移除
  - **验证**: `curl -X DELETE localhost:8000/api/admin/photos/1`

- [x] T050 创建 PATCH /api/admin/photos/{id} 端点
  - **文件**: `backend/app/api/photos.py`
  - **标准**: 更新 display_order, is_main_photo
  - **验证**: `curl -X PATCH localhost:8000/api/admin/photos/1 -d '{"is_main_photo":true}'`

### 音乐上传

- [x] T051 创建 POST /api/admin/music 上传端点
  - **文件**: `backend/app/api/music.py`
  - **标准**: 接收音频文件，保存到 uploads/music/，停用之前的
  - **验证**: `curl -X POST -F "file=@test.mp3" localhost:8000/api/admin/music`

### 配置管理

- [x] T052 创建 PUT /api/admin/blessing 端点
  - **文件**: `backend/app/api/blessing.py`
  - **标准**: 更新 paragraphs 数组
  - **验证**: `curl -X PUT localhost:8000/api/admin/blessing -d '{"paragraphs":["test"]}'`

- [x] T053 创建 PUT /api/admin/config 端点
  - **文件**: `backend/app/api/config.py`
  - **标准**: 更新 visitor_password_enabled, bloom_enabled_default 等
  - **验证**: `curl -X PUT localhost:8000/api/admin/config -d '{"visitor_password_enabled":false}'`

### 静态文件服务

- [x] T054 配置 uploads 静态文件服务
  - **文件**: `backend/app/main.py`
  - **标准**: /uploads/* 路由到 backend/uploads/
  - **验证**: `curl localhost:8000/uploads/webp/test.webp` 返回文件

**检查点**: 后端完成，所有端点可通过 curl 测试

---

## Phase 3: 前端静态流程

**目的**: 构建前端页面无复杂视觉，可测试导航

### API Client

- [x] T055 创建带 fetch wrapper 的 API client
  - **文件**: `frontend/src/lib/api-client.ts`
  - **标准**: getPhotos(), getMusic(), getConfig(), verifyPassword() 函数工作
  - **验证**: 从测试组件调用 API client，console 打印响应

- [x] T056 从契约创建 TypeScript 类型
  - **文件**: `frontend/src/types/index.ts`
  - **标准**: PhotoResponse, MusicResponse, ConfigResponse 等已定义
  - **验证**: 导入类型无错误

### Zustand Stores

- [x] T057 [P] 创建 configStore 用于应用设置
  - **文件**: `frontend/src/stores/configStore.ts`
  - **标准**: 存储 visitor_password_enabled, particle_tier, bloom_enabled
  - **验证**: API fetch 后 console 打印 store 状态

- [x] T058 [P] 创建 screenStore 用于导航状态
  - **文件**: `frontend/src/stores/screenStore.ts`
  - **标准**: 存储 current screen, screens_completed 数组
  - **验证**: console 打印屏幕进展

- [x] T059 [P] 创建 audioStore 用于音乐状态
  - **文件**: `frontend/src/stores/audioStore.ts`
  - **标准**: 存储 isPlaying, audioElement 引用
  - **验证**: console 打印音频状态

### 页面结构

- [x] T060 创建 /ForJiaXue 页面布局
  - **文件**: `frontend/src/app/ForJiaXue/page.tsx`
  - **标准**: 页面渲染，从 API 获取 config
  - **验证**: 打开 /ForJiaXue，检查 console 的 API 响应

- [x] T061 创建密码输入组件（如果启用）
  - **文件**: `frontend/src/components/entry/PasswordEntry.tsx`
  - **标准**: 密码输入，验证按钮，失败显示错误消息
  - **验证**: 输入错误密码看错误；正确密码继续

- [x] T062 创建入口屏幕容器
  - **文件**: `frontend/src/components/entry/EntryScreen.tsx`
  - **标准**: 密码 + 花瓣动画占位容器
  - **验证**: 组件渲染，显示动画占位

### 屏幕组件（静态占位）

- [x] T063 [P] 创建粒子屏幕占位
  - **文件**: `frontend/src/components/particles/ParticleScreen.tsx`
  - **标准**: 占位 div 显示 "粒子屏幕" 文字
  - **验证**: 导航到粒子屏幕，看到占位

- [x] T064 [P] 创建照片墙屏幕占位
  - **文件**: `frontend/src/components/photo-wall/PhotoWallScreen.tsx`
  - **标准**: 占位 div 显示 "照片墙屏幕" 文字
  - **验证**: 导航到照片墙屏幕，看到占位

- [x] T065 [P] 创建解锁屏幕占位
  - **文件**: `frontend/src/components/unlock/UnlockScreen.tsx`
  - **标准**: 占位 div 显示 "解锁屏幕" 文字
  - **验证**: 导航到解锁屏幕，看到占位

- [x] T066 [P] 创建结局屏幕占位
  - **文件**: `frontend/src/components/finale/FinaleScreen.tsx`
  - **标准**: 占位 div 显示 "结局屏幕" 文字
  - **验证**: 导航到结局屏幕，看到占位

### 导航流程（静态）

- [x] T067 实现垂直滚动导航带 sections
  - **文件**: `frontend/src/app/ForJiaXue/page.tsx`
  - **标准**: 每个屏幕是滚动 section，scroll snaps 工作
  - **验证**: 滚动所有占位，每个 section 可见

- [x] T068 创建 "下一步" 按钮屏幕间导航
  - **文件**: `frontend/src/components/ui/NextButton.tsx`
  - **标准**: 点击按钮滚动到下一 section
  - **验证**: 点击 "下一步"，滚动到下一个占位

- [x] T069 在 screenStore 追踪屏幕进展
  - **文件**: `frontend/src/hooks/useScroll.ts`
  - **标准**: 滚动位置更新 screenStore.screens_completed
  - **验证**: console 打印滚动时 screens_completed 更新

### UI 组件

- [x] T070 [P] 创建加载指示器组件
  - **文件**: `frontend/src/components/ui/LoadingIndicator.tsx`
  - **标准**: API fetch 时显示 spinner
  - **验证**: config 加载前看到加载指示器

- [x] T071 [P] 创建错误消息组件
  - **文件**: `frontend/src/components/ui/ErrorMessage.tsx`
  - **标准**: 优雅显示 API 错误
  - **验证**: 模拟 API 错误，看到错误消息

**检查点**: 前端静态流程完成，导航工作，占位可见

---

## Phase 4: 粒子视觉（细粒度）

**目的**: 逐步构建粒子系统，每个任务独立可测试

⚠️ **关键**: 不要提前写复杂 shader。从简单开始，逐步增加复杂度。

### R3F 设置

- [x] T072 在粒子屏幕创建基本 R3F Canvas
  - **文件**: `frontend/src/components/particles/ParticleCanvas.tsx`
  - **标准**: Canvas 渲染，显示空 WebGL 场景
  - **验证**: 打开粒子屏幕，WebGL canvas 可见，无错误

- [x] T073 创建带 OrbitControls 的 Three.js 场景（用于测试）
  - **文件**: `frontend/src/components/particles/ParticleCanvas.tsx`
  - **标准**: 场景带 camera, controls, 背景色
  - **验证**: Canvas 渲染，可用鼠标 orbit camera

### 粒子几何（暂无 Shader）

- [x] T074 创建随机位置的简单 Points geometry
  - **文件**: `frontend/src/three/geometry/createTestParticles.ts`
  - **标准**: 1000 个随机位置点，显示为白点
  - **验证**: Canvas 显示散布白点

- [x] T075 创建带 position attribute array 的 BufferGeometry
  - **文件**: `frontend/src/three/geometry/ParticleGeometry.ts`
  - **标准**: position attribute 为 Float32Array，数量可配置
  - **验证**: console 打印 position array 长度匹配粒子数量

- [x] T076 添加 color attribute 到 BufferGeometry
  - **文件**: `frontend/src/three/geometry/ParticleGeometry.ts`
  - **标准**: color attribute 为 Float32Array (RGB)，每个粒子有颜色
  - **验证**: 粒子渲染有不同颜色（暂时用 PointsMaterial）

- [x] T077 添加 size attribute 到 BufferGeometry
  - **文件**: `frontend/src/three/geometry/ParticleGeometry.ts`
  - **标准**: size attribute 为 Float32Array，每个粒子有大小
  - **验证**: console 打印 size array，粒子渲染有不同大小

### 图像采样（生成粒子数据）

- [x] T078 创建图像加载工具
  - **文件**: `frontend/src/lib/image-loader.ts`
  - **标准**: 加载图像，返回 ImageData 或 canvas
  - **验证**: console 打印加载图像尺寸

- [x] T079 创建像素采样函数生成粒子位置
  - **文件**: `frontend/src/lib/particle-utils.ts`
  - **标准**: 按网格间隔采样图像，返回 {x, y, color} 数组
  - **验证**: console 打印采样数量、位置、颜色

- [x] T080 从 API particle_map JSON 创建粒子数据
  - **文件**: `frontend/src/lib/particle-utils.ts`
  - **标准**: 解析 particle_map.json，创建 BufferGeometry 数据
  - **验证**: 加载测试 particle_map.json，console 打印粒子数量

### 简单 Shader Material（渐进）

- [x] T081 创建基本 vertex shader（仅位置）
  - **文件**: `frontend/src/three/shaders/particle.vert.glsl`
  - **标准**: Vertex shader 从 position attribute 输出 gl_Position
  - **验证**: 粒子在正确位置渲染

- [x] T082 创建基本 fragment shader（仅颜色）
  - **文件**: `frontend/src/three/shaders/particle.frag.glsl`
  - **标准**: Fragment shader 从 color attribute 输出颜色
  - **验证**: 粒子以正确颜色渲染

- [x] T083 创建带 uniforms（color, size）的 ShaderMaterial
  - **文件**: `frontend/src/three/particle-engine/ParticleMaterial.ts`
  - **标准**: Material 使用自定义 shaders，uniforms 工作
  - **验证**: 改变 uniform 值，看到视觉变化

- [x] T084 添加 pointSize uniform 用于缩放
  - **文件**: `frontend/src/three/shaders/particle.vert.glsl`, `frontend/src/three/particle-engine/ParticleMaterial.ts`
  - **标准**: pointSize uniform 缩放所有粒子
  - **验证**: 改变 pointSize，粒子大小变化

### 进度动画（聚合）

- [x] T085 创建 progress uniform（0.0 到 1.0）
  - **文件**: `frontend/src/three/particle-engine/ParticleMaterial.ts`
  - **标准**: progress uniform 控制聚合状态
  - **验证**: 设置 progress 为 0.5，看到中间状态

- [x] T086 创建目标位置 attribute（粒子应聚合的位置）
  - **文件**: `frontend/src/three/geometry/ParticleGeometry.ts`
  - **标准**: targetPosition attribute 存储图像位置
  - **验证**: console 打印目标位置数组

- [x] T087 创建初始随机位置 attribute
  - **文件**: `frontend/src/three/geometry/ParticleGeometry.ts`
  - **标准**: initialPosition attribute 存储散布位置
  - **验证**: console 打印初始位置数组（随机值）

- [x] T088 更新 vertex shader 基于 progress 插值
  - **文件**: `frontend/src/three/shaders/particle.vert.glsl`
  - **标准**: shader 中 mix(initialPosition, targetPosition, progress)
  - **验证**: 从 0 到 1 动画 progress，粒子聚合

- [x] T089 用 GSAP 创建进度动画
  - **文件**: `frontend/src/hooks/useProgressAnimation.ts`
  - **标准**: GSAP 在 5-8 秒内 tween progress uniform 0→1
  - **验证**: 动画播放，粒子从散布移动到图像

### 指针扰动

- [x] T090 创建鼠标/触摸位置追踪 hook
  - **文件**: `frontend/src/hooks/usePointerPosition.ts`
  - **标准**: 以标准化坐标追踪指针位置
  - **验证**: 移动时 console 打印指针位置

- [x] T091 在 ShaderMaterial 创建 pointer uniform
  - **文件**: `frontend/src/three/particle-engine/ParticleMaterial.ts`
  - **标准**: pointer uniform (vec2) 传给 shader
  - **验证**: console 打印 uniform 值更新

- [x] T092 创建散布半径 uniform
  - **文件**: `frontend/src/three/particle-engine/ParticleMaterial.ts`
  - **标准**: scatterRadius uniform 控制扰动区域
  - **验证**: 改变 scatterRadius，扰动区域变化

- [x] T093 更新 vertex shader 在指针附近散布
  - **文件**: `frontend/src/three/shaders/particle.vert.glsl`
  - **标准**: 距指针距离检查，半径内散布
  - **验证**: 指针移近粒子，看到散布效果

- [x] T094 创建散布重置动画（线性 3 秒）
  - **文件**: `frontend/src/hooks/useScatterReset.ts`
  - **标准**: 指针离开后，粒子线性返回
  - **验证**: 指针移开，观察粒子平滑返回

### 粒子分层系统

- [x] T095 创建性能检测 hook
  - **文件**: `frontend/src/hooks/usePerformance.ts`
  - **标准**: 通过 FPS 测试或 UA 检测设备分层（high/medium/low）
  - **验证**: 加载时 console 打印检测分层

- [x] T096 创建每层粒子数量配置
  - **文件**: `frontend/src/lib/performance.ts`
  - **标准**: high=60000, medium=30000, low=12000 定义
  - **验证**: console 打印当前分层粒子数量

- [x] T097 集成分层检测与粒子生成
  - **文件**: `frontend/src/components/particles/ParticleScreen.tsx`
  - **标准**: 粒子数量匹配检测分层
  - **验证**: 手机显示 medium 数量，桌面显示 high

### Bloom/Glow 效果（可选）

- [x] T098 创建 EffectComposer 设置
  - **文件**: `frontend/src/three/particle-engine/PostProcessing.ts`
  - **标准**: EffectComposer 用 passes 渲染场景
  - **验证**: 后处理启用，看到 bloom 效果

- [x] T099 创建 UnrealBloomPass 配置
  - **文件**: `frontend/src/three/particle-engine/PostProcessing.ts`
  - **标准**: Bloom pass 可配置强度/半径
  - **验证**: 调整 bloom 设置，看到光晕强度变化

- [x] T100 基于性能分层创建 Bloom 切换
  - **文件**: `frontend/src/components/particles/ParticleScreen.tsx`
  - **标准**: low 分层禁用 Bloom
  - **验证**: low 分层设备显示无 bloom

### 完整粒子场景

- [x] T101 集成所有粒子组件到 ParticleScreen
  - **文件**: `frontend/src/components/particles/ParticleScreen.tsx`
  - **标准**: 完整粒子聚合带指针交互，分层感知
  - **验证**: 播放聚合，指针交互，检查 FPS

**检查点**: 粒子视觉完成，聚合工作，交互工作，性能感知

---

## Phase 5-12 简要描述

**Phase 5: 3D照片墙** - 圆柱形照片墙几何、滚动旋转交互、点击放大、灯光效果

**Phase 6: 音乐同步** - Web Audio 设置、频率分析、粒子亮度/大小/散布响应、背景星星

**Phase 7: 入口花瓣动画** - 花瓣SVG/PNG资产、飘落动画、开始按钮、过渡到粒子屏幕

**Phase 8: 手势解锁** - MediaPipe Hands初始化、心形手势检测、尝试计数、降级按钮

**Phase 9: 结局** - 花瓣/玫瑰动画、渐变背景、粒子从屏幕四周出发在屏幕中间组成一束粒子玫瑰花（浪漫）,再比心玫瑰花破碎粒子散开组成一张照片，这些粒子也能组成祝福文字打字机效果

**Phase 10: 秘密消息** - 消息输入组件、提交API、成功反馈

**Phase 11: 优化打磨** - 加载状态、错误处理、FPS监控、shader优化、响应式、无障碍

**Phase 12: Docker部署** - Dockerfiles、docker-compose.yml、验证脚本

### Phase 5：3D 照片墙（T102-T110）

- [x] T102 实现圆柱照片墙布局计算 — **文件**: `frontend/src/three/photo-wall/layout.ts`、对应测试 — **标准**: 输入数量/半径返回均匀位置与朝向 — **验证**: `node --no-warnings --experimental-strip-types --test src/three/photo-wall/layout.test.mjs`
- [x] T103 创建带纹理的照片卡片 — **文件**: `frontend/src/components/photo-wall/PhotoCard.tsx` — **标准**: WebP 纹理、圆角边框和克制高光可见 — **验证**: `npx tsc --noEmit && npm run lint`
- [x] T104 创建照片墙 Canvas 并接入 `/api/photos` — **文件**: `frontend/src/components/photo-wall/PhotoWallCanvas.tsx`、`PhotoWallScreen.tsx` — **标准**: wall_photos 按圆柱布局渲染，空数据有高级感 fallback — **验证**: 浏览器检查 `#wall canvas` 可见且 Console 无 WebGL 错误
- [x] T105 实现拖拽/滚轮旋转 — **文件**: `frontend/src/hooks/useWallRotation.ts`、对应测试 — **标准**: 阻尼旋转且不抢占页面纵向导航 — **验证**: `node --no-warnings --experimental-strip-types --test src/hooks/useWallRotation.test.mjs`
- [x] T106 实现照片点击命中与选择状态 — **文件**: `frontend/src/components/photo-wall/PhotoCard.tsx`、`photoWallStore.ts` — **标准**: 点击卡片记录唯一 photo id — **验证**: `npx tsc --noEmit && npm run lint`
- [x] T107 实现照片放大动画 — **文件**: `frontend/src/components/photo-wall/PhotoLightbox.tsx` — **标准**: 选中照片平滑进入前景，背景柔和虚化 — **验证**: 浏览器点击照片并检查 lightbox 可见
- [x] T108 实现关闭和键盘 Escape — **文件**: `frontend/src/components/photo-wall/PhotoLightbox.tsx` — **标准**: 点击遮罩、关闭按钮、Escape 均恢复墙体 — **验证**: 浏览器执行三种关闭路径
- [x] T109 添加环境光与色调映射 — **文件**: `frontend/src/components/photo-wall/PhotoWallCanvas.tsx` — **标准**: 暗部保留细节且肤色不偏色 — **验证**: 浏览器截图审查曝光层次
- [x] T110 添加玫瑰金点光源和移动端降级 — **文件**: `frontend/src/components/photo-wall/PhotoWallCanvas.tsx` — **标准**: 桌面有柔和轮廓光，低层设备减少灯光/卡片 — **验证**: 桌面与 390px 视口均无错误和横向溢出

### Phase 6：音乐同步（T111-T123）

- [x] T111 创建可由点击恢复的 AudioContext — **文件**: `frontend/src/hooks/useAudio.ts`、对应测试 — **标准**: 未经手势不自动播放，点击后 resume — **验证**: `node --no-warnings --experimental-strip-types --test src/hooks/useAudio.test.mjs`
- [x] T112 从 `/api/music` 加载 audio element — **文件**: `frontend/src/hooks/useAudio.ts` — **标准**: 使用 API origin 解析媒体 URL并处理空音乐 — **验证**: 浏览器 Network 中音乐请求指向后端
- [x] T113 连接 MediaElementSource 到输出 — **文件**: `frontend/src/hooks/useAudio.ts` — **标准**: 每个 element 只连接一次且声音可听 — **验证**: `npx tsc --noEmit && npm run lint`
- [x] T114 配置 AnalyserNode FFT 256 — **文件**: `frontend/src/lib/audio-analyser.ts`、对应测试 — **标准**: frequencyBinCount=128 — **验证**: `node --no-warnings --experimental-strip-types --test src/lib/audio-analyser.test.mjs`
- [x] T115 计算 bass/mid/treble 能量 — **文件**: `frontend/src/lib/audio-analyser.ts`、对应测试 — **标准**: 三频输出归一化 0..1 — **验证**: 同上测试文件
- [x] T116 扩展 audioStore 能量状态 — **文件**: `frontend/src/stores/audioStore.ts` — **标准**: 保存三频与总强度 — **验证**: `npx tsc --noEmit`
- [x] T117 音乐驱动粒子亮度 — **文件**: `ParticleMaterial.ts`、`ParticleCanvas.tsx` — **标准**: 强度提高时亮度适度提升不闪白 — **验证**: 浏览器播放音乐观察亮度变化
- [x] T118 音乐驱动粒子大小 — **文件**: 同上 — **标准**: bass 平滑调制 pointSize — **验证**: 浏览器播放/暂停比较点尺寸
- [x] T119 音乐驱动轻微扩散 — **文件**: 同上 — **标准**: treble 仅产生克制扰动，不破坏主体轮廓 — **验证**: 浏览器观察主体仍可辨识
- [x] T120 创建音乐响应背景星尘 — **文件**: `frontend/src/components/particles/AudioStars.tsx` — **标准**: 星尘密度按性能层且响应 mid — **验证**: 390px 与桌面 Console 无错误
- [x] T121 同步播放进度和结束状态 — **文件**: `useAudio.ts`、`audioStore.ts` — **标准**: time/duration/isPlaying 一致 — **验证**: `npx tsc --noEmit && npm run lint`
- [x] T122 创建无障碍播放/暂停控件 — **文件**: `frontend/src/components/audio/AudioControl.tsx` — **标准**: 键盘可操作且 aria-label 准确 — **验证**: 浏览器键盘操作
- [x] T123 保持跨屏音乐连续 — **文件**: `frontend/src/app/ForJiaXue/page.tsx` — **标准**: 单一 audio 生命周期跨 section 不重启 — **验证**: 完整滚动时 Network 不重复下载音乐

### Phase 7：入口动画（T124-T127）

- [x] T124 创建轻量 SVG 花瓣资产 — **文件**: `frontend/public/assets/petal.svg` — **标准**: 矢量、无外部版权资产、体积小 — **验证**: `Get-Item public/assets/petal.svg`
- [x] T125 创建分层花瓣与星光动画 — **文件**: `frontend/src/components/entry/PetalField.tsx` — **标准**: 随机节奏、低透明度、支持 reduced-motion — **验证**: 浏览器截图和 reduced-motion 检查
- [x] T126 重做高级感入口主视觉和开始按钮 — **文件**: `EntryScreen.tsx` — **标准**: 深酒红/玫瑰金、克制排版、无俗艳渐变 — **验证**: 桌面与移动截图审查
- [x] T127 点击开始时播放音乐并过渡粒子屏 — **文件**: `EntryScreen.tsx`、`page.tsx` — **标准**: 同一用户手势触发 audio resume 与平滑过渡 — **验证**: 浏览器点击一次完成两项动作

### Phase 8：手势解锁（T128-T136）

- [x] T128 接入 MediaPipe Hand Landmarker — **文件**: `frontend/src/lib/gesture/hand-landmarker.ts` — **标准**: 延迟加载模型且不阻塞首屏 — **验证**: `npx tsc --noEmit && npm run build`
- [x] T129 创建摄像头帧关键点检测 hook — **文件**: `frontend/src/hooks/useGesture.ts` — **标准**: 单一流、卸载释放 tracks — **验证**: 浏览器授权后可看到关键点状态
- [x] T130 定义双手比心几何特征 — **文件**: `frontend/src/lib/gesture/heart-gesture.ts`、对应测试 — **标准**: 基于拇指/食指距离与手掌方向 — **验证**: `node --no-warnings --experimental-strip-types --test src/lib/gesture/heart-gesture.test.mjs`
- [x] T131 实现带置信度和连续帧的匹配 — **文件**: 同上 — **标准**: 连续命中才成功，降低误触 — **验证**: 同上测试文件
- [x] T132 记录失败尝试次数 — **文件**: `frontend/src/stores/gestureStore.ts` — **标准**: 每次完整尝试仅计一次 — **验证**: `npx tsc --noEmit`
- [x] T133 创建相机预览与引导反馈 — **文件**: `frontend/src/components/unlock/GestureUnlock.tsx` — **标准**: 清晰说明姿势和实时状态 — **验证**: 浏览器授权流程
- [x] T134 四次失败后显示降级按钮 — **文件**: 同上 — **标准**: 文案来自 config 且用户不会被卡死 — **验证**: 模拟四次失败后按钮可见
- [x] T135 处理拒绝/无摄像头/模型失败 — **文件**: 同上 — **标准**: 立即提供降级继续路径 — **验证**: 浏览器拒绝权限后仍可进入结局
- [x] T136 解锁成功过渡结局 — **文件**: `UnlockScreen.tsx`、`screenStore.ts` — **标准**: 成功仅触发一次并平滑进入 finale — **验证**: 浏览器模拟成功

### Phase 9：结局（T137-T141）

- [x] T137 创建粒子玫瑰聚合序列 — **文件**: `frontend/src/components/finale/FinaleParticles.tsx` — **标准**: 四周光尘聚成克制玫瑰轮廓 — **验证**: 浏览器观察完整动画且 Console 无 WebGL 错误
- [x] T138 实现比心后玫瑰破碎并重组成主照片 — **文件**: 同上 — **标准**: 过渡连贯、无上传照片时使用抽象光影 fallback — **验证**: 浏览器运行两种数据状态
- [x] T139 获取 `/api/blessing` 段落并处理失败 — **文件**: `FinaleScreen.tsx` — **标准**: API 文案优先，失败显示克制默认祝福 — **验证**: 正常与断网两种浏览器路径
- [x] T140 创建可取消的打字机组件 — **文件**: `frontend/src/components/finale/TypewriterText.tsx`、对应测试 — **标准**: 支持中文、卸载清理 timer、reduced-motion 立即显示 — **验证**: `node --no-warnings --experimental-strip-types --test src/components/finale/TypewriterText.test.mjs`
- [x] T141 顺序展示多段祝福并完成结局构图 — **文件**: `FinaleScreen.tsx` — **标准**: 文字层级、留白、照片和粒子互不遮挡 — **验证**: 桌面/390px 截图审查

### Phase 10：秘密消息（T142-T144）

- [x] T142 创建秘密消息表单 — **文件**: `frontend/src/components/finale/SecretMessageForm.tsx` — **标准**: 字数限制、标签、键盘可用 — **验证**: `npm run lint && npx tsc --noEmit`
- [x] T143 调用 `POST /api/messages` — **文件**: `api-client.ts`、`SecretMessageForm.tsx` — **标准**: 正确 payload、防重复提交、失败可重试 — **验证**: 浏览器 Network 检查 201
- [x] T144 创建成功反馈并验证管理端可读 — **文件**: `SecretMessageForm.tsx` — **标准**: 成功后不泄露管理数据，admin API 能读取 — **验证**: 提交后用认证 curl 查询消息

### Phase 11：优化打磨（T145-T150）

- [ ] T145 统一异步 skeleton/loading — **文件**: 各 screen 与 UI 组件 — **标准**: 不闪白、不产生布局跳动 — **验证**: 浏览器慢速网络检查
- [ ] T146 统一 API/WebGL/媒体错误边界 — **文件**: `ErrorMessage.tsx`、各 screen — **标准**: 每种失败均有可恢复路径 — **验证**: 断后端与禁 WebGL 测试
- [ ] T147 暴露轻量 FPS 监控与自动降级 — **文件**: `usePerformance.ts` — **标准**: 连续低帧才降级且不反复抖动 — **验证**: 软件 WebGL 环境稳定 ≥45 FPS
- [ ] T148 优化 geometry/material 生命周期 — **文件**: 3D 组件 — **标准**: 卸载 dispose、无重复 composer/audio source — **验证**: 多次跨屏后内存/Console 无增长警告
- [ ] T149 完成移动端响应式和安全区 — **文件**: 页面/全局样式 — **标准**: 320–1440px 无横向溢出，按钮避开 safe-area — **验证**: 浏览器 responsive 截图
- [ ] T150 完成 reduced-motion 与基础无障碍 — **文件**: 全局样式与交互组件 — **标准**: 焦点可见、语义标签、对比度、动画降级 — **验证**: 键盘全流程和浏览器 accessibility tree

### Phase 12：Docker 部署（T151-T161）

- [ ] T151 创建多阶段前端 Dockerfile — **文件**: `frontend/Dockerfile` — **标准**: production standalone、非 root、无 node_modules 入 context — **验证**: `docker build -t forjiaxue-frontend frontend`
- [ ] T152 创建后端 Dockerfile — **文件**: `backend/Dockerfile` — **标准**: Python 3.11 slim、非 root、持久目录可写 — **验证**: `docker build -t forjiaxue-backend backend`
- [ ] T153 创建 compose 编排 — **文件**: `docker-compose.yml` — **标准**: 前后端、网络、uploads/data volumes 和依赖健康检查 — **验证**: `docker compose config`
- [ ] T154 创建根/前后端 `.dockerignore` — **文件**: `.dockerignore` 等 — **标准**: 排除 Git、构建产物、数据库、uploads、env、测试缓存 — **验证**: `docker build` context 不含禁入目录
- [ ] T155 创建环境变量模板 — **文件**: `.env.example`、README — **标准**: 仅占位符，无密钥，说明 API origin/CORS/admin secret — **验证**: `git grep -nE '(password|secret|token)=' -- .env.example`
- [ ] T156 启动完整 Compose — **文件**: `docker-compose.yml` — **标准**: `up --build` 后容器均 healthy — **验证**: `docker compose up --build -d && docker compose ps`
- [ ] T157 验证容器前端 — **文件**: `scripts/verify-deployment.ps1` — **标准**: `/ForJiaXue` 返回 200 — **验证**: `Invoke-WebRequest http://localhost:3000/ForJiaXue`
- [ ] T158 验证容器后端 APIs — **文件**: 同脚本 — **标准**: health/photos/music/config/blessing 均成功 — **验证**: 运行 PowerShell 验证脚本
- [ ] T159 验证容器照片上传处理 — **文件**: 同脚本/后端测试 — **标准**: 上传后生成 WebP/thumb/particle-map 且重启仍存在 — **验证**: 使用临时小图上传、重启、查询后删除临时数据
- [ ] T160 运行完整浏览器体验 — **文件**: `frontend/e2e/romantic-flow.spec.ts` — **标准**: 入口→粒子→照片墙→降级解锁→结局→留言全通 — **验证**: `npx playwright test e2e/romantic-flow.spec.ts`
- [ ] T161 完成部署文档和一键验证 — **文件**: `README.md`、`scripts/verify-deployment.ps1` — **标准**: 新环境按文档可启动、验证、停止且不生成入库数据 — **验证**: `powershell -ExecutionPolicy Bypass -File scripts/verify-deployment.ps1`

---

## 依赖与执行顺序

### Phase 依赖

```
Phase 1 (骨架) ──────────────────────────────────────┐
                                                      │
Phase 2 (后端) ───────────────────────────────────────┤
                                                      │
Phase 3 (前端静态) ───────────────────────────────────┤
                                                      │
Phase 4 (粒子) ───────────────────────────────────────┤ (依赖后端 photos API)
                                                      │
Phase 5 (照片墙) ──────────────────────────────────────┤ (依赖后端 photos API)
                                                      │
Phase 6 (音乐同步) ────────────────────────────────────┤
                                                      │
Phase 7 (入口动画) ────────────────────────────────────┤
                                                      │
Phase 8 (手势解锁) ────────────────────────────────────┤
                                                      │
Phase 9 (结局) ────────────────────────────────────────┤ (依赖后端 blessing API)
                                                      │
Phase 10 (秘密消息) ───────────────────────────────────┤
                                                      │
Phase 11 (优化) ───────────────────────────────────────┤
                                                      │
Phase 12 (Docker) ─────────────────────────────────────┘
```

---

## 实现策略

### MVP 优先（Phase 1-4）

1. 完成 Phase 1: 骨架
2. 完成 Phase 2: 后端（所有端点）
3. 完成 Phase 3: 前端静态流程（占位）
4. 完成 Phase 4: 粒子视觉（核心体验）
5. **停止并验证**: 测试完整粒子聚合流程

### 逐步交付

MVP 后：
- 添加 Phase 5: 照片墙 → 测试可浏览照片
- 添加 Phase 6: 音乐同步 → 测试音频响应
- 添加 Phase 7: 入口动画 → 测试入口流程
- 添加 Phase 8: 手势解锁 → 测试解锁流程
- 添加 Phase 9: 结局 → 测试完整体验
- 添加 Phase 10-11: 打磨 → 测试优化 UX
- 添加 Phase 12: Docker → 测试部署

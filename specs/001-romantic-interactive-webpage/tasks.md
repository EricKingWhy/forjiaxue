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

- [ ] T029 创建 GET /api/photos 端点
  - **文件**: `backend/app/api/photos.py`, `backend/app/main.py`
  - **标准**: 返回 main_photo 和 wall_photos 数组
  - **验证**: `curl localhost:8000/api/photos`

- [ ] T030 创建 GET /api/music 端点
  - **文件**: `backend/app/api/music.py`, `backend/app/main.py`
  - **标准**: 返回活跃音乐轨道 URL
  - **验证**: `curl localhost:8000/api/music`

- [ ] T031 创建 GET /api/config 端点
  - **文件**: `backend/app/api/config.py`, `backend/app/main.py`
  - **标准**: 返回 visitor_password_enabled, particle_tier_default 等
  - **验证**: `curl localhost:8000/api/config`

- [ ] T032 创建 POST /api/config/verify-password 端点
  - **文件**: `backend/app/api/config.py`, `backend/app/services/auth.py`
  - **标准**: 返回 {valid: true/false} 密码检查结果
  - **验证**: `curl -X POST localhost:8000/api/config/verify-password -d '{"password":"test"}'`

- [ ] T033 创建 GET /api/blessing 端点
  - **文件**: `backend/app/api/blessing.py`, `backend/app/main.py`
  - **标准**: 返回 paragraphs 数组用于打字机效果
  - **验证**: `curl localhost:8000/api/blessing`

- [ ] T034 创建 POST /api/messages 端点（秘密消息）
  - **文件**: `backend/app/api/messages.py`, `backend/app/main.py`
  - **标准**: 创建 SecretMessage，返回 id 和 timestamp
  - **验证**: `curl -X POST localhost:8000/api/messages -d '{"content":"test"}'`

- [ ] T035 创建 POST /api/stats/visit 端点（进入动作）
  - **文件**: `backend/app/api/stats.py`, `backend/app/main.py`
  - **标准**: 创建 VisitEvent 包含 ip_hash, device_type
  - **验证**: `curl -X POST localhost:8000/api/stats/visit -d '{"ip_hash":"abc","device_type":"mobile","action":"enter"}'`

- [ ] T036 创建 POST /api/stats/visit 端点（退出动作）
  - **文件**: `backend/app/api/stats.py`
  - **标准**: 更新 VisitEvent 包含 screens_completed, duration
  - **验证**: `curl -X POST localhost:8000/api/stats/visit -d '{"ip_hash":"abc","action":"exit","screens_completed":["entry"]}'`

### 管理员认证

- [ ] T037 创建密码哈希服务
  - **文件**: `backend/app/services/auth.py`, `backend/app/core/security.py`
  - **标准**: SHA-256 哈希函数工作，ADMIN_PASSWORD 验证
  - **验证**: Python 测试脚本哈希并验证密码

- [ ] T038 创建 POST /api/admin/auth 端点
  - **文件**: `backend/app/api/admin.py`, `backend/app/main.py`
  - **标准**: 正确 ADMIN_PASSWORD 返回 JWT token
  - **验证**: `curl -X POST localhost:8000/api/admin/auth -d '{"password":"admin123"}'`

### 管理员端点

- [ ] T039 创建 GET /api/admin/stats 端点
  - **文件**: `backend/app/api/stats.py`, `backend/app/services/stats.py`
  - **标准**: 返回 total_visits, device_breakdown, recent_visits
  - **验证**: `curl -H "Authorization: Bearer <token>" localhost:8000/api/admin/stats`

- [ ] T040 创建 GET /api/admin/messages 端点
  - **文件**: `backend/app/api/messages.py`
  - **标准**: 返回 messages 数组包含 unread_count
  - **验证**: `curl -H "Authorization: Bearer <token>" localhost:8000/api/admin/messages`

- [ ] T041 创建 PATCH /api/admin/messages/{id} 端点
  - **文件**: `backend/app/api/messages.py`
  - **标准**: 更新 is_read 状态
  - **验证**: `curl -X PATCH -H "Authorization: Bearer <token>" localhost:8000/api/admin/messages/1 -d '{"is_read":true}'`

### 照片上传处理（细粒度）

- [ ] T042 创建文件验证服务（格式、大小）
  - **文件**: `backend/app/services/image_processor.py`
  - **标准**: 验证 jpg/jpeg/png/webp ≤10MB, mp3/m4a/wav ≤20MB
  - **验证**: Python 测试脚本验证有效/无效文件

- [ ] T043 创建 EXIF 移除函数
  - **文件**: `backend/app/services/image_processor.py`
  - **标准**: EXIF 数据完全从图像移除
  - **验证**: 处理测试图像，检查输出无 EXIF

- [ ] T044 创建 WebP 转换函数（质量 85）
  - **文件**: `backend/app/services/image_processor.py`
  - **标准**: 图像转换为质量 85 的 WebP
  - **验证**: 处理测试图像，输出为 WebP 格式

- [ ] T045 创建缩略图生成函数（高度 300px）
  - **文件**: `backend/app/services/image_processor.py`
  - **标准**: 缩略图高度 300px，宽度等比例
  - **验证**: 处理测试图像，缩略图尺寸正确

- [ ] T046 创建粒子图生成函数
  - **文件**: `backend/app/services/particle_map.py`
  - **标准**: 生成 {x, y, color} 位置的 JSON 数组
  - **验证**: 处理测试图像，输出 JSON 结构正确

- [ ] T047 创建完整照片处理流水线
  - **文件**: `backend/app/services/image_processor.py`
  - **标准**: 组合：EXIF → WebP → Thumb → ParticleMap
  - **验证**: 上传测试照片，所有输出已生成

- [ ] T048 创建 POST /api/admin/photos 上传端点
  - **文件**: `backend/app/api/photos.py`
  - **标准**: 接收 multipart 文件，处理，保存到 DB 和 uploads/
  - **验证**: `curl -X POST -F "file=@test.jpg" localhost:8000/api/admin/photos`

- [ ] T049 创建 DELETE /api/admin/photos/{id} 端点
  - **文件**: `backend/app/api/photos.py`
  - **标准**: 照片从 DB 删除，文件移除
  - **验证**: `curl -X DELETE localhost:8000/api/admin/photos/1`

- [ ] T050 创建 PATCH /api/admin/photos/{id} 端点
  - **文件**: `backend/app/api/photos.py`
  - **标准**: 更新 display_order, is_main_photo
  - **验证**: `curl -X PATCH localhost:8000/api/admin/photos/1 -d '{"is_main_photo":true}'`

### 音乐上传

- [ ] T051 创建 POST /api/admin/music 上传端点
  - **文件**: `backend/app/api/music.py`
  - **标准**: 接收音频文件，保存到 uploads/music/，停用之前的
  - **验证**: `curl -X POST -F "file=@test.mp3" localhost:8000/api/admin/music`

### 配置管理

- [ ] T052 创建 PUT /api/admin/blessing 端点
  - **文件**: `backend/app/api/blessing.py`
  - **标准**: 更新 paragraphs 数组
  - **验证**: `curl -X PUT localhost:8000/api/admin/blessing -d '{"paragraphs":["test"]}'`

- [ ] T053 创建 PUT /api/admin/config 端点
  - **文件**: `backend/app/api/config.py`
  - **标准**: 更新 visitor_password_enabled, bloom_enabled_default 等
  - **验证**: `curl -X PUT localhost:8000/api/admin/config -d '{"visitor_password_enabled":false}'`

### 静态文件服务

- [ ] T054 配置 uploads 静态文件服务
  - **文件**: `backend/app/main.py`
  - **标准**: /uploads/* 路由到 backend/uploads/
  - **验证**: `curl localhost:8000/uploads/webp/test.webp` 返回文件

**检查点**: 后端完成，所有端点可通过 curl 测试

---

## Phase 3: 前端静态流程

**目的**: 构建前端页面无复杂视觉，可测试导航

### API Client

- [ ] T055 创建带 fetch wrapper 的 API client
  - **文件**: `frontend/src/lib/api-client.ts`
  - **标准**: getPhotos(), getMusic(), getConfig(), verifyPassword() 函数工作
  - **验证**: 从测试组件调用 API client，console 打印响应

- [ ] T056 从契约创建 TypeScript 类型
  - **文件**: `frontend/src/types/index.ts`
  - **标准**: PhotoResponse, MusicResponse, ConfigResponse 等已定义
  - **验证**: 导入类型无错误

### Zustand Stores

- [ ] T057 [P] 创建 configStore 用于应用设置
  - **文件**: `frontend/src/stores/configStore.ts`
  - **标准**: 存储 visitor_password_enabled, particle_tier, bloom_enabled
  - **验证**: API fetch 后 console 打印 store 状态

- [ ] T058 [P] 创建 screenStore 用于导航状态
  - **文件**: `frontend/src/stores/screenStore.ts`
  - **标准**: 存储 current screen, screens_completed 数组
  - **验证**: console 打印屏幕进展

- [ ] T059 [P] 创建 audioStore 用于音乐状态
  - **文件**: `frontend/src/stores/audioStore.ts`
  - **标准**: 存储 isPlaying, audioElement 引用
  - **验证**: console 打印音频状态

### 页面结构

- [ ] T060 创建 /ForJiaXue 页面布局
  - **文件**: `frontend/src/app/ForJiaXue/page.tsx`
  - **标准**: 页面渲染，从 API 获取 config
  - **验证**: 打开 /ForJiaXue，检查 console 的 API 响应

- [ ] T061 创建密码输入组件（如果启用）
  - **文件**: `frontend/src/components/entry/PasswordEntry.tsx`
  - **标准**: 密码输入，验证按钮，失败显示错误消息
  - **验证**: 输入错误密码看错误；正确密码继续

- [ ] T062 创建入口屏幕容器
  - **文件**: `frontend/src/components/entry/EntryScreen.tsx`
  - **标准**: 密码 + 花瓣动画占位容器
  - **验证**: 组件渲染，显示动画占位

### 屏幕组件（静态占位）

- [ ] T063 [P] 创建粒子屏幕占位
  - **文件**: `frontend/src/components/particles/ParticleScreen.tsx`
  - **标准**: 占位 div 显示 "粒子屏幕" 文字
  - **验证**: 导航到粒子屏幕，看到占位

- [ ] T064 [P] 创建照片墙屏幕占位
  - **文件**: `frontend/src/components/photo-wall/PhotoWallScreen.tsx`
  - **标准**: 占位 div 显示 "照片墙屏幕" 文字
  - **验证**: 导航到照片墙屏幕，看到占位

- [ ] T065 [P] 创建解锁屏幕占位
  - **文件**: `frontend/src/components/unlock/UnlockScreen.tsx`
  - **标准**: 占位 div 显示 "解锁屏幕" 文字
  - **验证**: 导航到解锁屏幕，看到占位

- [ ] T066 [P] 创建结局屏幕占位
  - **文件**: `frontend/src/components/finale/FinaleScreen.tsx`
  - **标准**: 占位 div 显示 "结局屏幕" 文字
  - **验证**: 导航到结局屏幕，看到占位

### 导航流程（静态）

- [ ] T067 实现垂直滚动导航带 sections
  - **文件**: `frontend/src/app/ForJiaXue/page.tsx`
  - **标准**: 每个屏幕是滚动 section，scroll snaps 工作
  - **验证**: 滚动所有占位，每个 section 可见

- [ ] T068 创建 "下一步" 按钮屏幕间导航
  - **文件**: `frontend/src/components/ui/NextButton.tsx`
  - **标准**: 点击按钮滚动到下一 section
  - **验证**: 点击 "下一步"，滚动到下一个占位

- [ ] T069 在 screenStore 追踪屏幕进展
  - **文件**: `frontend/src/hooks/useScroll.ts`
  - **标准**: 滚动位置更新 screenStore.screens_completed
  - **验证**: console 打印滚动时 screens_completed 更新

### UI 组件

- [ ] T070 [P] 创建加载指示器组件
  - **文件**: `frontend/src/components/ui/LoadingIndicator.tsx`
  - **标准**: API fetch 时显示 spinner
  - **验证**: config 加载前看到加载指示器

- [ ] T071 [P] 创建错误消息组件
  - **文件**: `frontend/src/components/ui/ErrorMessage.tsx`
  - **标准**: 优雅显示 API 错误
  - **验证**: 模拟 API 错误，看到错误消息

**检查点**: 前端静态流程完成，导航工作，占位可见

---

## Phase 4: 粒子视觉（细粒度）

**目的**: 逐步构建粒子系统，每个任务独立可测试

⚠️ **关键**: 不要提前写复杂 shader。从简单开始，逐步增加复杂度。

### R3F 设置

- [ ] T072 在粒子屏幕创建基本 R3F Canvas
  - **文件**: `frontend/src/components/particles/ParticleCanvas.tsx`
  - **标准**: Canvas 渲染，显示空 WebGL 场景
  - **验证**: 打开粒子屏幕，WebGL canvas 可见，无错误

- [ ] T073 创建带 OrbitControls 的 Three.js 场景（用于测试）
  - **文件**: `frontend/src/components/particles/ParticleCanvas.tsx`
  - **标准**: 场景带 camera, controls, 背景色
  - **验证**: Canvas 渲染，可用鼠标 orbit camera

### 粒子几何（暂无 Shader）

- [ ] T074 创建随机位置的简单 Points geometry
  - **文件**: `frontend/src/three/geometry/createTestParticles.ts`
  - **标准**: 1000 个随机位置点，显示为白点
  - **验证**: Canvas 显示散布白点

- [ ] T075 创建带 position attribute array 的 BufferGeometry
  - **文件**: `frontend/src/three/geometry/ParticleGeometry.ts`
  - **标准**: position attribute 为 Float32Array，数量可配置
  - **验证**: console 打印 position array 长度匹配粒子数量

- [ ] T076 添加 color attribute 到 BufferGeometry
  - **文件**: `frontend/src/three/geometry/ParticleGeometry.ts`
  - **标准**: color attribute 为 Float32Array (RGB)，每个粒子有颜色
  - **验证**: 粒子渲染有不同颜色（暂时用 PointsMaterial）

- [ ] T077 添加 size attribute 到 BufferGeometry
  - **文件**: `frontend/src/three/geometry/ParticleGeometry.ts`
  - **标准**: size attribute 为 Float32Array，每个粒子有大小
  - **验证**: console 打印 size array，粒子渲染有不同大小

### 图像采样（生成粒子数据）

- [ ] T078 创建图像加载工具
  - **文件**: `frontend/src/lib/image-loader.ts`
  - **标准**: 加载图像，返回 ImageData 或 canvas
  - **验证**: console 打印加载图像尺寸

- [ ] T079 创建像素采样函数生成粒子位置
  - **文件**: `frontend/src/lib/particle-utils.ts`
  - **标准**: 按网格间隔采样图像，返回 {x, y, color} 数组
  - **验证**: console 打印采样数量、位置、颜色

- [ ] T080 从 API particle_map JSON 创建粒子数据
  - **文件**: `frontend/src/lib/particle-utils.ts`
  - **标准**: 解析 particle_map.json，创建 BufferGeometry 数据
  - **验证**: 加载测试 particle_map.json，console 打印粒子数量

### 简单 Shader Material（渐进）

- [ ] T081 创建基本 vertex shader（仅位置）
  - **文件**: `frontend/src/three/shaders/particle.vert.glsl`
  - **标准**: Vertex shader 从 position attribute 输出 gl_Position
  - **验证**: 粒子在正确位置渲染

- [ ] T082 创建基本 fragment shader（仅颜色）
  - **文件**: `frontend/src/three/shaders/particle.frag.glsl`
  - **标准**: Fragment shader 从 color attribute 输出颜色
  - **验证**: 粒子以正确颜色渲染

- [ ] T083 创建带 uniforms（color, size）的 ShaderMaterial
  - **文件**: `frontend/src/three/particle-engine/ParticleMaterial.ts`
  - **标准**: Material 使用自定义 shaders，uniforms 工作
  - **验证**: 改变 uniform 值，看到视觉变化

- [ ] T084 添加 pointSize uniform 用于缩放
  - **文件**: `frontend/src/three/shaders/particle.vert.glsl`, `frontend/src/three/particle-engine/ParticleMaterial.ts`
  - **标准**: pointSize uniform 缩放所有粒子
  - **验证**: 改变 pointSize，粒子大小变化

### 进度动画（聚合）

- [ ] T085 创建 progress uniform（0.0 到 1.0）
  - **文件**: `frontend/src/three/particle-engine/ParticleMaterial.ts`
  - **标准**: progress uniform 控制聚合状态
  - **验证**: 设置 progress 为 0.5，看到中间状态

- [ ] T086 创建目标位置 attribute（粒子应聚合的位置）
  - **文件**: `frontend/src/three/geometry/ParticleGeometry.ts`
  - **标准**: targetPosition attribute 存储图像位置
  - **验证**: console 打印目标位置数组

- [ ] T087 创建初始随机位置 attribute
  - **文件**: `frontend/src/three/geometry/ParticleGeometry.ts`
  - **标准**: initialPosition attribute 存储散布位置
  - **验证**: console 打印初始位置数组（随机值）

- [ ] T088 更新 vertex shader 基于 progress 插值
  - **文件**: `frontend/src/three/shaders/particle.vert.glsl`
  - **标准**: shader 中 mix(initialPosition, targetPosition, progress)
  - **验证**: 从 0 到 1 动画 progress，粒子聚合

- [ ] T089 用 GSAP 创建进度动画
  - **文件**: `frontend/src/hooks/useProgressAnimation.ts`
  - **标准**: GSAP 在 5-8 秒内 tween progress uniform 0→1
  - **验证**: 动画播放，粒子从散布移动到图像

### 指针扰动

- [ ] T090 创建鼠标/触摸位置追踪 hook
  - **文件**: `frontend/src/hooks/usePointerPosition.ts`
  - **标准**: 以标准化坐标追踪指针位置
  - **验证**: 移动时 console 打印指针位置

- [ ] T091 在 ShaderMaterial 创建 pointer uniform
  - **文件**: `frontend/src/three/particle-engine/ParticleMaterial.ts`
  - **标准**: pointer uniform (vec2) 传给 shader
  - **验证**: console 打印 uniform 值更新

- [ ] T092 创建散布半径 uniform
  - **文件**: `frontend/src/three/particle-engine/ParticleMaterial.ts`
  - **标准**: scatterRadius uniform 控制扰动区域
  - **验证**: 改变 scatterRadius，扰动区域变化

- [ ] T093 更新 vertex shader 在指针附近散布
  - **文件**: `frontend/src/three/shaders/particle.vert.glsl`
  - **标准**: 距指针距离检查，半径内散布
  - **验证**: 指针移近粒子，看到散布效果

- [ ] T094 创建散布重置动画（线性 3 秒）
  - **文件**: `frontend/src/hooks/useScatterReset.ts`
  - **标准**: 指针离开后，粒子线性返回
  - **验证**: 指针移开，观察粒子平滑返回

### 粒子分层系统

- [ ] T095 创建性能检测 hook
  - **文件**: `frontend/src/hooks/usePerformance.ts`
  - **标准**: 通过 FPS 测试或 UA 检测设备分层（high/medium/low）
  - **验证**: 加载时 console 打印检测分层

- [ ] T096 创建每层粒子数量配置
  - **文件**: `frontend/src/lib/performance.ts`
  - **标准**: high=60000, medium=30000, low=12000 定义
  - **验证**: console 打印当前分层粒子数量

- [ ] T097 集成分层检测与粒子生成
  - **文件**: `frontend/src/components/particles/ParticleScreen.tsx`
  - **标准**: 粒子数量匹配检测分层
  - **验证**: 手机显示 medium 数量，桌面显示 high

### Bloom/Glow 效果（可选）

- [ ] T098 创建 EffectComposer 设置
  - **文件**: `frontend/src/three/particle-engine/PostProcessing.ts`
  - **标准**: EffectComposer 用 passes 渲染场景
  - **验证**: 后处理启用，看到 bloom 效果

- [ ] T099 创建 UnrealBloomPass 配置
  - **文件**: `frontend/src/three/particle-engine/PostProcessing.ts`
  - **标准**: Bloom pass 可配置强度/半径
  - **验证**: 调整 bloom 设置，看到光晕强度变化

- [ ] T100 基于性能分层创建 Bloom 切换
  - **文件**: `frontend/src/components/particles/ParticleScreen.tsx`
  - **标准**: low 分层禁用 Bloom
  - **验证**: low 分层设备显示无 bloom

### 完整粒子场景

- [ ] T101 集成所有粒子组件到 ParticleScreen
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

**Phase 9: 结局** - 花瓣/玫瑰动画、渐变背景、祝福文字打字机效果

**Phase 10: 秘密消息** - 消息输入组件、提交API、成功反馈

**Phase 11: 优化打磨** - 加载状态、错误处理、FPS监控、shader优化、响应式、无障碍

**Phase 12: Docker部署** - Dockerfiles、docker-compose.yml、验证脚本

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

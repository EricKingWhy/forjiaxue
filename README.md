# ForJiaXue 浪漫互动网页

为求婚 / 纪念日场景打造的全栈互动网页：粒子聚合 → 3D 照片墙 → 手势解锁 → 结局动画 → 秘密留言。

## 技术栈

| 层 | 技术 |
|----|------|
| 前端 | Next.js 16 · TypeScript · Tailwind · three.js (R3F) · GSAP · Zustand |
| 后端 | FastAPI · SQLAlchemy · SQLite · Pillow / OpenCV（EXIF 移除、WebP、缩略图、粒子图）|
| 部署 | Docker Compose（前端 standalone + 后端 slim，非 root）|

## 本地开发

```bash
# 后端
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 前端（另开终端）
cd frontend
npm install
npm run dev   # http://localhost:3000/ForJiaXue
```

## Docker 部署

### 1. 准备环境变量
```bash
cp .env.example .env
# 编辑 .env，替换 ADMIN_PASSWORD 和 JWT_SECRET 为强值
```

### 2. 构建并启动
```bash
docker compose up --build -d
```
- 前端：http://localhost:3000/ForJiaXue
- 后端 API：http://localhost:8000/api/health
- 持久数据：`backend-data`（SQLite）和 `backend-uploads`（图片/音乐）两个命名卷

### 3. 验证（一键）
```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify-deployment.ps1
```
脚本会自动：构建 → 等待 healthy → 检查 5 个后端 API → 检查前端 `/ForJiaXue` → 汇报结果。仅调用只读公开接口，不写入入库数据。

### 4. 停止
```bash
docker compose down          # 保留数据卷
docker compose down -v       # 同时删除数据卷（清空数据库与上传文件）
```

## 管理后台

- 登录：`POST /api/admin/auth`（用 `.env` 里的 `ADMIN_PASSWORD`）
- 上传照片：`POST /api/admin/photos`（自动 EXIF 移除 + WebP + 缩略图 + 粒子图）
- 上传音乐：`POST /api/admin/music`
- 配置：`PUT /api/admin/config`、`PUT /api/admin/blessing`
- 查看留言 / 访问统计：`GET /api/admin/messages`、`GET /api/admin/stats`

## 项目结构

```
backend/          FastAPI 后端（API + 图像处理流水线）
frontend/         Next.js 前端（粒子 / 照片墙 / 手势 / 结局 / 留言）
specs/            spec-kit 规范文档（spec / plan / tasks / data-model / contracts）
scripts/          部署验证脚本
docker-compose.yml
.env.example
```

## 进度

Phase 1–11 完成（T001–T150）。Phase 12 Docker 部署进行中。
完整任务清单见 `specs/001-romantic-interactive-webpage/tasks.md`。

## 关键约束

| 约束 | 值 |
|------|-----|
| 照片格式 | jpg/jpeg/png/webp，≤10MB |
| 音乐格式 | mp3/m4a/wav，≤20MB |
| EXIF | 上传时强制移除 |
| IP 存储 | 仅 SHA-256 哈希，不存原始 IP |
| 粒子分层 | high=60000 / medium=30000 / low=12000，低层禁用 Bloom |
| 前端路由 | `/ForJiaXue` 固定 |

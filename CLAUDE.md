# CLAUDE.md

## 项目目标

这是一个私密互动浪漫网页项目。

必须包含：
- 入口互动体验
- 照片粒子聚合效果
- 3D记忆照片墙
- 滚动叙事流程
- 音乐驱动视觉效果
- MediaPipe手势解锁
- FastAPI管理后台
- 照片上传和处理
- 私密访问链接
- 基本访问事件统计

## 技术栈

前端：
- Next.js
- React
- TypeScript
- React Three Fiber
- Three.js
- @react-three/drei
- GSAP
- Framer Motion
- Zustand
- Web Audio API
- MediaPipe Hand Landmarker

后端：
- Python 3.11
- FastAPI
- SQLite
- SQLAlchemy
- Pillow
- OpenCV
- 本地uploads目录

## 核心规则

- 编码前先思考。
- 不要猜测需求。有疑问就问或明确写出假设。
- 优先小步、可验证的实现步骤。
- 不要修改无关文件。
- 不要重写大型模块，除非明确要求。
- 没有验证证据不要声称完成。
- 修改代码后，运行最小相关验证命令。
- 如果命令失败，报告具体错误并修复根本原因。
- 保持移动端视觉体验流畅。
- 每个高级效果必须有降级方案。

## 产品方向

体验应该克制、优雅、私密。
不要创建廉价模板页面。
不要用过多效果堆砌页面。

核心情感路径：
1. 开始
2. 照片从粒子中浮现
3. 记忆以3D墙的形式呈现
4. 音乐驱动微妙视觉变化
5. 手势解锁揭示最终祝福

## 实现约束

- 不要使用 react-particle-image。
- 用 React Three Fiber + Three.js Shader 实现主照片粒子场景。
- Particular Drift 仅作为参考：图像到粒子、边缘流动、GLSL、流场概念。
- Interactive Particles 仅作为参考：离屏纹理、鼠标/触摸扰动、shader交互。
- 不要直接复制参考项目源码。
- 保持后端和前端清晰分离。

## 前端分层

- app: Next.js路由
- components: UI和场景组件
- three: shader、几何体、粒子引擎、R3F工具
- hooks: 音频、手势、故事配置
- stores: Zustand状态
- lib: API客户端和共享助手

## 后端分层

- api: FastAPI路由器
- schemas: Pydantic请求响应模型
- models: SQLAlchemy模型
- services: 图像处理、故事配置、访问、事件
- core: 配置和共享工具

## 必需验证

前端：
- npm run lint
- npm run build
- 手动移动端视口测试

后端：
- uvicorn app.main:app --reload
- curl /api/health
- 手动Swagger测试上传和故事API

部署：
- docker compose up --build
- 打开 /love/{slug}
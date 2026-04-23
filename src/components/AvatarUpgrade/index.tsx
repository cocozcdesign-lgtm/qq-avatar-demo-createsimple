import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import html2canvas from 'html2canvas';
import './style.css';

export type UpgradeVariant = 'flip' | 'shake' | 'float';
export type ScanVariant = 'sweep' | 'outline';
export type RevealVariant = 'silhouette' | 'pillar' | 'particle';
export type FlowType = 'full' | 'infiltrate';
export type TransitionVariant = 'direct' | 'shrink' | 'shatter';
export type AwakenVariant = 'click' | 'auto';
export type SaveVariant = 'simple' | 'edit';
export type SaveExitVariant = 'shrink-to-corner' | 'fly-out';
export type IntroVariant = 'replace' | 'stack';

interface SoulDimension {
  key: string;
  label: string;
  side: 'left' | 'right';
  filled: boolean;
  value?: string;
}

const SOUL_DIMENSIONS: SoulDimension[] = [
  { key: 'appearance', label: '外表', side: 'left', filled: true, value: '已设置' },
  { key: 'personality', label: '性格', side: 'right', filled: false },
  { key: 'catchphrase', label: '口头禅', side: 'left', filled: false },
  { key: 'voice', label: '声音', side: 'right', filled: false },
];

interface AvatarUpgradeProps {
  visible: boolean;
  onClose: () => void;
  avatarSrc: string;
  onStartUpgrade?: () => void;
  variant?: UpgradeVariant;
  scanVariant?: ScanVariant;
  revealVariant?: RevealVariant;
  editable?: boolean;
  flowType?: FlowType;
  transitionVariant?: TransitionVariant;
  awakenVariant?: AwakenVariant;
  saveVariant?: SaveVariant;
  saveExitVariant?: SaveExitVariant;
  introVariant?: IntroVariant;
  onSave?: () => void;
}

interface TagDef {
  label: string;
  size: number;
  active?: boolean;
}

interface PlacedTag extends TagDef {
  x: number;
  y: number;
}

const ACTIVE_TAG_DEFS: TagDef[] = [
  { label: 'Minecraft', size: 80, active: true },
  { label: '喵星人', size: 72, active: true },
  { label: '手办', size: 64, active: true },
  { label: '潮流穿搭', size: 88, active: true },
  { label: '巨蟹座', size: 68, active: true },
];

const SUGGEST_TAG_DEFS: TagDef[] = [
  { label: '二次元', size: 70 },
  { label: '摄影', size: 62 },
  { label: '美食', size: 74 },
  { label: '旅行', size: 66 },
  { label: '音乐', size: 78 },
  { label: '电影', size: 60 },
  { label: '健身', size: 64 },
  { label: '阅读', size: 58 },
  { label: '编程', size: 62 },
  { label: '露营', size: 56 },
  { label: '滑板', size: 66 },
  { label: '咖啡', size: 60 },
  { label: '汉服', size: 68 },
  { label: '绘画', size: 58 },
  { label: '星座', size: 64 },
];

const GAP = 6;
const AVATAR_RADIUS = 72;
const BOUNDS_W = 428;
const BOUNDS_H = 540;

function collides(
  x1: number, y1: number, r1: number,
  x2: number, y2: number, r2: number,
  gap: number,
): boolean {
  const dx = x1 - x2;
  const dy = y1 - y2;
  const minDist = r1 + r2 + gap;
  return dx * dx + dy * dy < minDist * minDist;
}

function placeAllTags(activeDefs: TagDef[], suggestDefs: TagDef[]): PlacedTag[] {
  const placed: PlacedTag[] = [];
  const avatarCircle = { x: 0, y: 0, r: AVATAR_RADIUS };

  const tryPlace = (tag: TagDef, startDist: number, maxDist: number): PlacedTag | null => {
    const r = tag.size / 2;
    for (let dist = startDist; dist <= maxDist; dist += 4) {
      const steps = Math.max(12, Math.floor((dist * Math.PI * 2) / (r * 1.5)));
      const angleOffset = dist * 0.1;
      for (let i = 0; i < steps; i++) {
        const angle = (i / steps) * Math.PI * 2 + angleOffset;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;
        if (Math.abs(x) + r > BOUNDS_W / 2 - 10) continue;
        if (y - r < -BOUNDS_H / 2 + 10) continue;
        if (y + r > BOUNDS_H / 2 - 60) continue;
        if (collides(x, y, r, avatarCircle.x, avatarCircle.y, avatarCircle.r, GAP)) continue;
        let ok = true;
        for (const p of placed) {
          if (collides(x, y, r, p.x, p.y, p.size / 2, GAP)) { ok = false; break; }
        }
        if (ok) return { ...tag, x, y };
      }
    }
    return null;
  };

  for (const tag of activeDefs) {
    const result = tryPlace(tag, AVATAR_RADIUS + tag.size / 2 + GAP, 200);
    if (result) placed.push(result);
  }
  for (const tag of suggestDefs) {
    const result = tryPlace(tag, AVATAR_RADIUS + 50, 280);
    if (result) placed.push(result);
  }
  return placed;
}

const AvatarUpgrade: React.FC<AvatarUpgradeProps> = ({
  visible,
  onClose,
  avatarSrc,
  onStartUpgrade,
  variant = 'float',
  scanVariant = 'outline',
  revealVariant = 'silhouette',
  editable = false,
  flowType = 'full',
  transitionVariant = 'direct',
  awakenVariant = 'click',
  saveVariant = 'simple',
  saveExitVariant = 'shrink-to-corner',
  introVariant = 'replace',
  onSave,
}) => {
  const [phase, setPhase] = useState(0);
  const [shopOpen, setShopOpen] = useState(false);
  const [shopActiveTab, setShopActiveTab] = useState<'捏脸' | '装扮'>('装扮');
  const [shopActiveCategory, setShopActiveCategory] = useState('套装');
  // phase 7: 升级动画（标签汇聚 + 头像放大）
  // phase 8: 头像边框扩展为矩形
  // phase 9: 扫光效果（~2s）
  // phase 10: 背景渐隐，只留人物
  // phase 11: 人像扫光扫描 / 人像描边
  // phase 12: 头像淡出 + 揭晓沉睡 avatar（跳过描边原图过渡）
  // phase 13: 维度选项卡片 + 操作按钮
  const [closing, setClosing] = useState(false);
  const [activatedLabels, setActivatedLabels] = useState<Set<string>>(
    () => new Set(ACTIVE_TAG_DEFS.map((t) => t.label))
  );

  // 进度文案轮换
  const PROGRESS_TEXTS_P9 = ['主体提取中'];
  const PROGRESS_TEXTS_P11 = ['部件拆分中', '服装搭配中', '发型分析中', '配饰检测中', '风格识别中'];
  const [progressIdx, setProgressIdx] = useState(0);
  const [dotCount, setDotCount] = useState(1);

  // 动态点点点：每500ms循环 . → .. → ...
  useEffect(() => {
    if (phase < 9) return;
    const timer = setInterval(() => {
      setDotCount(prev => (prev % 3) + 1);
    }, 500);
    return () => clearInterval(timer);
  }, [phase]);

  // 每3秒轮换文案
  useEffect(() => {
    if (phase < 11) { setProgressIdx(0); return; }
    const timer = setInterval(() => {
      setProgressIdx(prev => (prev + 1) % PROGRESS_TEXTS_P11.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [phase]);
  const [contourPath, setContourPath] = useState<string>('');
  const [contourLen, setContourLen] = useState(0);
  const outlineGroupRef = useRef<SVGGElement | null>(null);
  const outlineAnimRef = useRef<number>(0);
  const gifDoneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gifCreatedRef = useRef<boolean>(false);
  const [awakenAmbience, setAwakenAmbience] = useState(false);
  const infiltrateTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const TRAIL_COUNT = 8; // 拖尾层数

  // 当描边 SVG 渲染后，通过 useEffect 获取路径长度
  useEffect(() => {
    if (phase < 11 || scanVariant !== 'outline' || !contourPath) return;
    // 使用 requestAnimationFrame 确保 DOM 已完成渲染
    const raf = requestAnimationFrame(() => {
      const groupEl = outlineGroupRef.current;
      if (groupEl) {
        const firstPath = groupEl.querySelector('path');
        if (firstPath) {
          const len = firstPath.getTotalLength();
          if (len > 0) setContourLen(len);
        }
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [phase, scanVariant, contourPath]);

  // rAF 驱动描边动画：无限循环 + 拖尾渐变
  useEffect(() => {
    if (phase < 11 || scanVariant !== 'outline') return;
    const groupEl = outlineGroupRef.current;
    if (!groupEl || contourLen <= 0) return;

    const paths = groupEl.querySelectorAll('path');
    if (!paths.length) return;

    const headLen = contourLen * 0.08; // 头部亮线段长度（8%）
    const trailLen = contourLen * 0.35; // 尾巴总长（35%）
    const loopDuration = 3000; // 一圈 3s
    const startTime = performance.now();

    // 初始化每层的 dasharray
    const trailSegLen = trailLen / TRAIL_COUNT;
    paths.forEach((p, i) => {
      const segVisible = i === 0 ? headLen : trailSegLen;
      p.style.strokeDasharray = `${segVisible} ${contourLen - segVisible}`;
      p.style.opacity = '0';
    });

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = (elapsed % loopDuration) / loopDuration;
      const baseOffset = contourLen * (1 - progress);

      // 淡入（前 300ms）
      const fadeIn = Math.min(1, elapsed / 300);

      paths.forEach((p, i) => {
        // 头部 path (i=0) 无偏移，后续层依次向后偏移
        const trailOffset = i === 0 ? 0 : headLen + trailSegLen * (i - 1);
        p.style.strokeDashoffset = `${baseOffset + trailOffset}`;

        // 头部最亮，尾巴渐弱
        const layerOpacity = i === 0
          ? 1.0
          : Math.max(0.03, 1.0 - (i / TRAIL_COUNT) * 1.1);
        p.style.opacity = `${layerOpacity * fadeIn}`;
      });

      outlineAnimRef.current = requestAnimationFrame(animate);
    };

    outlineAnimRef.current = requestAnimationFrame(animate);

    return () => {
      if (outlineAnimRef.current) cancelAnimationFrame(outlineAnimRef.current);
    };
  }, [phase, scanVariant, contourLen]);

  // 提取去背景图片轮廓（用于描边方案）—— Moore 邻域追踪
  useEffect(() => {
    if (scanVariant !== 'outline') return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      // 缩小图片加速处理
      const scale = 0.25;
      const w = Math.floor(img.naturalWidth * scale);
      const h = Math.floor(img.naturalHeight * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;

      const threshold = 30;
      const isSolid = (x: number, y: number) => {
        if (x < 0 || x >= w || y < 0 || y >= h) return false;
        return data[(y * w + x) * 4 + 3] > threshold;
      };

      // 找起始点：从上到下、从左到右第一个不透明像素
      let startX = -1, startY = -1;
      outer: for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          if (isSolid(x, y)) {
            startX = x; startY = y;
            break outer;
          }
        }
      }
      if (startX < 0) return;

      // Moore 邻域追踪（8连通边界追踪）
      const dx = [1, 1, 0, -1, -1, -1, 0, 1];
      const dy = [0, 1, 1, 1, 0, -1, -1, -1];

      const contour: { x: number; y: number }[] = [];
      let cx = startX, cy = startY;
      let dir = 7;
      const maxSteps = w * h;

      for (let step = 0; step < maxSteps; step++) {
        contour.push({ x: cx, y: cy });
        let searchDir = (dir + 5) % 8;
        let found = false;
        for (let i = 0; i < 8; i++) {
          const nd = (searchDir + i) % 8;
          const nx = cx + dx[nd];
          const ny = cy + dy[nd];
          if (isSolid(nx, ny)) {
            cx = nx;
            cy = ny;
            dir = nd;
            found = true;
            break;
          }
        }
        if (!found) break;
        // 至少走足够多步才认为是回到起点（避免小圈提前终止）
        if (cx === startX && cy === startY && contour.length > Math.max(20, (w + h))) break;
      }

      if (contour.length < 10) return;

      // 1) 降采样：保留约 150 个点以保持形状精度
      const targetCount = Math.min(150, contour.length);
      const sampleStep = Math.max(1, Math.floor(contour.length / targetCount));
      let sampled: { x: number; y: number }[] = [];
      for (let i = 0; i < contour.length; i += sampleStep) {
        sampled.push(contour[i]);
      }

      if (sampled.length < 5) return;

      // 2) 轻度平滑：小半径 + 少轮次，防止轮廓收缩为一个点
      const smoothPass = (pts: { x: number; y: number }[], radius: number, iterations: number) => {
        let result = pts;
        for (let iter = 0; iter < iterations; iter++) {
          const next: { x: number; y: number }[] = [];
          const len = result.length;
          for (let i = 0; i < len; i++) {
            let sx = 0, sy = 0, count = 0;
            for (let j = -radius; j <= radius; j++) {
              const idx = (i + j + len) % len;
              sx += result[idx].x;
              sy += result[idx].y;
              count++;
            }
            next.push({ x: sx / count, y: sy / count });
          }
          result = next;
        }
        return result;
      };
      sampled = smoothPass(sampled, 1, 2);

      // 归一化到 viewBox 0-100
      const origW = img.naturalWidth;
      const origH = img.naturalHeight;
      const pts = sampled.map(p => ({
        x: (p.x / scale) * (100 / origW),
        y: (p.y / scale) * (100 / origH),
      }));

      // 3) Catmull-Rom 样条 → 平滑闭合曲线（加大张力系数 /2.5 使曲线更圆润）
      let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`;
      for (let i = 0; i < pts.length; i++) {
        const p0 = pts[(i - 1 + pts.length) % pts.length];
        const p1 = pts[i];
        const p2 = pts[(i + 1) % pts.length];
        const p3 = pts[(i + 2) % pts.length];

        const cp1x = p1.x + (p2.x - p0.x) / 2.5;
        const cp1y = p1.y + (p2.y - p0.y) / 2.5;
        const cp2x = p2.x - (p3.x - p1.x) / 2.5;
        const cp2y = p2.y - (p3.y - p1.y) / 2.5;

        d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
      }
      d += ' Z';
      setContourPath(d);
    };
    img.src = '/qq-avatar-demo-createsimple/assets/avatar-nobg.png';
  }, [scanVariant]);

  // gif 播放完成后进入 phase 15（保存形象）
  useEffect(() => {
    if (phase === 14) {
      gifDoneTimerRef.current = setTimeout(() => setPhase(15), 4200);
      const ambienceTimer = setTimeout(() => setAwakenAmbience(true), 2100);
      return () => {
        if (gifDoneTimerRef.current) {
          clearTimeout(gifDoneTimerRef.current);
          gifDoneTimerRef.current = null;
        }
        clearTimeout(ambienceTimer);
      };
    }
    if (phase < 14) {
      setAwakenAmbience(false);
      gifCreatedRef.current = false;
    }
    return () => {
      if (gifDoneTimerRef.current) {
        clearTimeout(gifDoneTimerRef.current);
        gifDoneTimerRef.current = null;
      }
    };
  }, [phase]);

  const placedTags = useMemo(() => {
    return placeAllTags(ACTIVE_TAG_DEFS, editable ? SUGGEST_TAG_DEFS : []);
  }, [editable]);

  const activeLabelsSet = useMemo(() => new Set(ACTIVE_TAG_DEFS.map(t => t.label)), []);

  useEffect(() => {
    if (!visible) {
      setPhase(0);
      setClosing(false);
      setSaving(false);
      setSavingFlyout(false);
      if (genieRafRef.current) cancelAnimationFrame(genieRafRef.current);
      if (genieCanvasRef.current) { genieCanvasRef.current.remove(); genieCanvasRef.current = null; }
      setActivatedLabels(new Set(ACTIVE_TAG_DEFS.map((t) => t.label)));
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    if (flowType === 'infiltrate') {
      // 渗透流程：先出头像（能量场背景），再逐句切换引言（4句）
      const t1 = setTimeout(() => setPhase(1), 600);
      const t2 = setTimeout(() => setPhase(2), 1600);
      const t3 = setTimeout(() => setPhase(3), 3400);
      const t4 = setTimeout(() => setPhase(4), 5200);
      const t5 = setTimeout(() => setPhase(5), 7000);
      const infiltrateTs = [t1, t2, t3, t4, t5];
      infiltrateTimersRef.current = infiltrateTs;
      timers.push(...infiltrateTs);
      // 不再自动推进，等待用户点击「唤醒QQ秀」按钮
    } else {
      // 长流程：气泡 → 头像出现 → 标签环
      timers.push(setTimeout(() => setPhase(1), 600));
      timers.push(setTimeout(() => setPhase(2), 1400));
      timers.push(setTimeout(() => setPhase(3), 3000));
      timers.push(setTimeout(() => setPhase(4), 3600));
      timers.push(setTimeout(() => setPhase(5), 4400));
      timers.push(setTimeout(() => setPhase(6), 4400));
    }

    return () => timers.forEach(clearTimeout);
  }, [visible, flowType]);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      onClose();
      setClosing(false);
      setPhase(0);
    }, 300);
  }, [onClose]);

  // 引言页点击跳过：清除剩余定时器，立即显示所有引言 + 按钮
  const handleSkipIntro = useCallback(() => {
    if (flowType !== 'infiltrate') return;
    if (phase >= 5) return; // 已经全部显示，无需跳过
    // 清除所有渗透流程定时器
    infiltrateTimersRef.current.forEach(clearTimeout);
    infiltrateTimersRef.current = [];
    setPhase(5);
  }, [flowType, phase]);

  const [saving, setSaving] = useState(false);
  const [savingFlyout, setSavingFlyout] = useState(false);

  const sheetRef = useRef<HTMLDivElement | null>(null);
  const genieRafRef = useRef<number>(0);
  const genieCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleSave = useCallback(() => {
    if (saving) return;
    if (saveExitVariant === 'shrink-to-corner') {
      setSaving(true);

      const sheetEl = sheetRef.current;
      if (!sheetEl) {
        setTimeout(() => { setSaving(false); setPhase(0); onSave?.(); }, 750);
        return;
      }

      // 1. 截图前：将 gif/canvas 元素临时替换为最后一帧静态图
      //    html2canvas 无法正确渲染 gif 动画和手绘 canvas
      const gifPlayEl = sheetEl.querySelector('.reveal-awaken-gif-play') as HTMLElement | null;
      const gifStaticEl = sheetEl.querySelector('.reveal-awaken-gif-static') as HTMLElement | null;
      let tempWrapper: HTMLElement | null = null;

      if (gifPlayEl) {
        // 用 div 包裹 img，与原始 gif 播放容器结构一致
        const wrapper = document.createElement('div');
        wrapper.className = gifPlayEl.className; // reveal-awaken-gif reveal-awaken-gif-play
        const img = document.createElement('img');
        img.src = '/qq-avatar-demo-createsimple/assets/awaken-last-frame.png';
        img.style.cssText = 'width:100%;height:100%;';
        wrapper.appendChild(img);
        tempWrapper = wrapper;
        gifPlayEl.parentElement?.insertBefore(wrapper, gifPlayEl);
        gifPlayEl.style.display = 'none';
      }
      if (gifStaticEl) {
        gifStaticEl.style.display = 'none';
      }

      // 2. 用 html2canvas 截取 sheet 为位图
      html2canvas(sheetEl, {
        background: undefined,
        scale: 1,
        useCORS: true,
        logging: false,
      } as any).then((snapshot: HTMLCanvasElement) => {
        // 恢复被临时替换的元素
        if (tempWrapper) { tempWrapper.remove(); tempWrapper = null; }
        if (gifPlayEl) gifPlayEl.style.display = '';
        if (gifStaticEl) gifStaticEl.style.display = '';

        const W = snapshot.width;
        const H = snapshot.height;

        // 2. 创建覆盖层 Canvas
        const canvas = document.createElement('canvas');
        canvas.width = 428;
        canvas.height = 932;
        canvas.style.cssText = 'position:absolute;top:0;left:0;width:428px;height:932px;z-index:200;pointer-events:none;';
        sheetEl.parentElement?.parentElement?.appendChild(canvas);
        genieCanvasRef.current = canvas;
        const ctx = canvas.getContext('2d')!;

        // 3. 隐藏原 sheet
        sheetEl.style.visibility = 'hidden';

        // sheet 在页面中的位置：bottom:0, height:640 → top = 932 - 640 = 292
        const SHEET_TOP = 932 - H;

        // 目标点：左上角头像中心（页面坐标）
        const TARGET_X = 30;
        const TARGET_Y = 60;

        const DURATION = 800;
        const SLICES = 60; // 水平切片数（越多越平滑）
        const sliceH = H / SLICES;

        const startTime = performance.now();

        const animate = (now: number) => {
          const elapsed = now - startTime;
          const rawT = Math.min(1, elapsed / DURATION);
          // ease-in 加速曲线（模拟被吸入的加速感）
          const t = rawT * rawT * (3 - 2 * rawT);

          ctx.clearRect(0, 0, 428, 932);

          for (let i = 0; i < SLICES; i++) {
            const srcY = i * sliceH;
            // 切片在页面中的原始 Y 位置
            const origY = SHEET_TOP + srcY;
            // 切片的归一化位置：0=顶部切片, 1=底部切片
            const sliceNorm = i / (SLICES - 1);

            // 核心：每个切片有自己的动画进度
            // 顶部切片先开始移动（靠近目标），底部切片有延迟
            // 这个差异化的时间偏移产生漏斗/吸入变形
            const delay = sliceNorm * 0.45; // 底部延迟 45% 的时间
            const sliceT = Math.max(0, Math.min(1, (t - delay) / (1 - delay)));
            // 给每个切片应用加速曲线
            const st = sliceT * sliceT;

            // --- 计算切片的目标位置 ---
            // X 方向：中心从 W/2 移向 TARGET_X
            const centerX = W / 2 + (TARGET_X - W / 2) * st;
            // 宽度：从 W 缩窄到接近 0
            const width = W * (1 - st * 0.97);
            // Y 方向：从原始位置移向 TARGET_Y
            const drawY = origY + (TARGET_Y - origY) * st;
            // 高度：随收缩压缩
            const drawH = sliceH * (1 - st * 0.85);

            const drawX = centerX - width / 2;

            // 透明度：最后阶段渐隐
            ctx.globalAlpha = Math.max(0, 1 - st * 0.5);

            if (width > 0.3 && drawH > 0.1) {
              ctx.drawImage(
                snapshot,
                0, srcY, W, sliceH,        // 源切片
                drawX, drawY, width, drawH  // 变形后目标
              );
            }
          }

          if (rawT < 1) {
            genieRafRef.current = requestAnimationFrame(animate);
          } else {
            // 动画完成：清理
            canvas.remove();
            genieCanvasRef.current = null;
            sheetEl.style.visibility = '';
            setSaving(false);
            setPhase(0);
            onSave?.();
          }
        };

        genieRafRef.current = requestAnimationFrame(animate);
      }).catch(() => {
        // 恢复被临时替换的元素
        if (tempWrapper) { tempWrapper.remove(); }
        if (gifPlayEl) gifPlayEl.style.display = '';
        if (gifStaticEl) gifStaticEl.style.display = '';
        // html2canvas 失败：直接完成
        setTimeout(() => { setSaving(false); setPhase(0); onSave?.(); }, 100);
      });

      return;
    } else {
      // fly-out: 半屏下滑 + 形象飞出
      setSaving(true);
      setSavingFlyout(true);
      setClosing(true);
      setTimeout(() => {
        setSavingFlyout(false);
        setSaving(false);
        setClosing(false);
        setPhase(0);
        onSave?.();
      }, 700);
    }
  }, [saving, saveExitVariant, onSave]);

  const handleStartUpgrade = useCallback(() => {
    setPhase(7);
    setTimeout(() => setPhase(8), 800);
    setTimeout(() => setPhase(9), 1500);
    setTimeout(() => setPhase(10), 3600);
    setTimeout(() => setPhase(11), 5100);
    setTimeout(() => setPhase(12), 11100); // 描边完成 → 头像淡出 + 揭晓沉睡 avatar
    setTimeout(() => setPhase(13), 13100); // 维度选项卡片 + 操作按钮
    setTimeout(() => onStartUpgrade?.(), 16100);
  }, [onStartUpgrade]);

  const handleToggleTag = useCallback((label: string) => {
    if (!editable || phase < 6 || phase >= 7) return;
    setActivatedLabels((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }, [editable, phase]);

  if (!visible && !closing && !saving) return null;

  const isFloating = variant === 'float' && phase >= 5 && phase < 7;
  const isUpgrading = phase >= 7;

  const innerTags = placedTags.filter(t => activeLabelsSet.has(t.label));
  const outerTags = placedTags.filter(t => !activeLabelsSet.has(t.label));

  return (
    <>
    <div className={`upgrade-overlay ${saving && saveExitVariant === 'shrink-to-corner' ? 'upgrade-overlay-save-fade' : ''} ${saving && saveExitVariant === 'fly-out' ? 'upgrade-overlay-save-fade' : ''}`} onClick={saving ? undefined : handleClose}>
      <div
        ref={sheetRef}
        className={`upgrade-sheet ${closing && !saving ? 'upgrade-sheet-closing' : ''} ${saving && saveExitVariant === 'fly-out' ? 'upgrade-sheet-closing' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          // 渗透流程引言阶段：点击任意位置跳过引言
          if (flowType === 'infiltrate' && phase >= 1 && phase < 5) {
            handleSkipIntro();
          }
        }}
      >
        <div className="upgrade-gradient-bg" />

        {/* 升级阶段背景图层：dissolve 渐显 */}
        {flowType === 'full' && phase >= 7 && (
          <img
            src="/qq-avatar-demo-createsimple/assets/upgrade-bg.png"
            alt=""
            className="upgrade-bg-illustration"
          />
        )}

        {flowType === 'full' && editable && phase >= 6 && phase < 7 && <div className="upgrade-edge-fade" />}

        <div className="upgrade-header">
          <span className="upgrade-title">创建QQ秀</span>
          <div className="upgrade-close-btn" onClick={handleClose}>
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
              <circle cx="15" cy="15" r="15" fill="rgba(0,0,0,0.06)" />
              <path
                d="M10.5 10.5L19.5 19.5M19.5 10.5L10.5 19.5"
                stroke="rgba(0,0,0,0.35)"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {flowType === 'full' && (
          <div className={`upgrade-bubbles ${phase >= 3 ? 'upgrade-bubbles-hide' : ''}`}>
            <div className={`upgrade-bubble ${phase >= 1 && phase < 3 ? 'upgrade-bubble-show' : ''}`}>
              <span>嘿，准备好了吗</span>
            </div>
            <div className={`upgrade-bubble upgrade-bubble-second ${phase >= 2 && phase < 3 ? 'upgrade-bubble-show' : ''}`}>
              <span>让你的头像</span>
              <span className="upgrade-bubble-bold">活过来</span>
            </div>
          </div>
        )}

        {/* 头像+标签区域 */}
        <div className={`upgrade-avatar-area ${flowType === 'infiltrate' ? `upgrade-avatar-area-center${introVariant === 'stack' ? ' upgrade-avatar-area-raised' : ''}` : ''} ${(flowType === 'infiltrate' ? phase >= 1 : phase >= 4) ? 'upgrade-avatar-show' : ''} ${flowType === 'infiltrate' && phase >= 6 && phase < 12 ? 'upgrade-avatar-area-pulse-shrink' : ''} ${phase >= 12 && transitionVariant === 'direct' ? 'upgrade-avatar-area-fadeout' : ''} ${phase >= 12 && transitionVariant === 'shrink' ? 'upgrade-avatar-area-shrink-out' : ''} ${phase >= 12 && transitionVariant === 'shatter' ? 'upgrade-avatar-area-shatter' : ''}`}>
          <div className={`upgrade-avatar-tags-wrapper ${isFloating ? 'upgrade-float-wrapper-active' : ''}`}>

            {/* 推荐标签 */}
            {flowType === 'full' && editable && phase >= 6 && outerTags.map((tag) => {
              const isActive = activatedLabels.has(tag.label);
              const converge = isUpgrading && isActive;
              const dissolve = isUpgrading && !isActive;
              return (
                <div
                  key={tag.label}
                  className={`upgrade-suggest-tag ${isActive ? 'upgrade-suggest-tag-active' : ''} ${converge ? 'upgrade-tag-converge' : ''} ${dissolve ? 'upgrade-tag-dissolve' : ''}`}
                  style={{
                    width: tag.size,
                    height: tag.size,
                    left: `calc(50% + ${tag.x - tag.size / 2}px)`,
                    top: `calc(50% + ${tag.y - tag.size / 2}px)`,
                    '--tag-ox': `${-tag.x}px`,
                    '--tag-oy': `${-tag.y}px`,
                  } as React.CSSProperties}
                  onClick={() => handleToggleTag(tag.label)}
                >
                  <span className="upgrade-suggest-tag-text">{tag.label}</span>
                </div>
              );
            })}

            {/* 标签环（内圈） */}
            <div className={`upgrade-tags-ring ${flowType === 'full' && phase >= 6 ? 'upgrade-tags-ring-show' : ''} ${isUpgrading ? 'upgrade-tags-ring-upgrading' : ''}`}>
              {innerTags.map((tag) => {
                const isActive = activatedLabels.has(tag.label);
                const converge = isUpgrading && isActive;
                const dissolve = isUpgrading && !isActive;
                return (
                  <div
                    key={tag.label}
                    className={`upgrade-tag ${editable ? 'upgrade-tag-editable' : ''} ${!isActive && !isUpgrading ? 'upgrade-tag-inactive' : ''} ${converge ? 'upgrade-tag-converge-inner' : ''} ${dissolve ? 'upgrade-tag-dissolve' : ''}`}
                    style={{
                      width: tag.size,
                      height: tag.size,
                      transform: converge
                        ? `translate(${-tag.size / 2}px, ${-tag.size / 2}px) scale(0)`
                        : `translate(${tag.x - tag.size / 2}px, ${tag.y - tag.size / 2}px)`,
                    }}
                    onClick={() => handleToggleTag(tag.label)}
                  >
                    <span className="upgrade-tag-text">{tag.label}</span>
                  </div>
                );
              })}
            </div>

            {/* 能量场背景：向上飘动的升级箭头（渗透流程） */}
            {flowType === 'infiltrate' && phase >= 1 && phase < 6 && (
              <div className="infiltrate-energy-field">
                {/* 底层柔光晕 */}
                <div className="energy-glow-base" />
                {/* 飘动的升级箭头 */}
                {Array.from({ length: 12 }, (_, i) => (
                  <div
                    key={`arrow-${i}`}
                    className={`energy-arrow energy-arrow-${i + 1}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M12 4L6 12h4v8h4v-8h4L12 4z" fill="currentColor" />
                    </svg>
                  </div>
                ))}
              </div>
            )}

            {/* 头像周围漂浮粒子（衔接后续粒子过渡） */}
            {flowType === 'infiltrate' && phase >= 1 && phase < 12 && (
              <div className="avatar-ambient-particles">
                {Array.from({ length: 18 }, (_, i) => {
                  const angle = (i / 18) * Math.PI * 2;
                  const radius = 110 + (i % 3) * 20;
                  const cx = Math.cos(angle) * radius + 150;
                  const cy = Math.sin(angle) * radius + 150;
                  const size = 3 + Math.random() * 4;
                  const dur = 2.5 + Math.random() * 2;
                  const delay = Math.random() * 3;
                  const driftX = (Math.random() - 0.5) * 20;
                  const driftY = (Math.random() - 0.5) * 20;
                  const driftX2 = (Math.random() - 0.5) * 16;
                  const driftY2 = (Math.random() - 0.5) * 16;
                  return (
                    <div
                      key={`amb-${i}`}
                      className="avatar-ambient-dot"
                      style={{
                        left: cx,
                        top: cy,
                        '--dot-size': `${size}px`,
                        '--float-dur': `${dur}s`,
                        '--float-delay': `${delay}s`,
                        '--drift-x': `${driftX}px`,
                        '--drift-y': `${driftY}px`,
                        '--drift-x2': `${driftX2}px`,
                        '--drift-y2': `${driftY2}px`,
                      } as React.CSSProperties}
                    />
                  );
                })}
              </div>
            )}

            {/* 脉冲波纹（点击唤醒后触发） */}
            {flowType === 'infiltrate' && phase >= 6 && phase < 12 && (
              <div className="pulse-ripple-container">
                <div className="pulse-ripple pulse-ripple-1" />
                <div className="pulse-ripple pulse-ripple-2" />
                <div className="pulse-ripple pulse-ripple-3" />
                {/* 收束光点 */}
                <div className="pulse-light-dot" />
              </div>
            )}

            {/* 头像 */}
            <div className={`upgrade-float-card ${flowType === 'full' && phase >= 6 && !isUpgrading ? 'upgrade-avatar-shrink' : ''} ${phase >= 5 && phase < 7 ? 'upgrade-float-active' : ''} ${flowType === 'infiltrate' && phase >= 6 && phase < 12 ? 'upgrade-float-card-pulse' : ''} ${flowType === 'full' && phase >= 7 ? 'upgrade-avatar-expand' : ''} ${flowType === 'full' && phase >= 8 ? 'upgrade-avatar-reveal' : ''} ${flowType === 'full' && phase >= 10 ? 'upgrade-avatar-nobg-mode' : ''} ${flowType === 'full' && phase >= 11 ? 'upgrade-scan-float' : ''}`}>
              <img src={avatarSrc} alt="avatar" className={`upgrade-avatar-img ${flowType === 'full' && phase >= 10 ? 'upgrade-avatar-img-fadeout' : ''} ${flowType === 'infiltrate' && transitionVariant === 'shatter' && phase >= 12 ? 'upgrade-avatar-img-shatter-hide' : ''}`} />
              {/* shatter 碎片层 */}
              {flowType === 'infiltrate' && transitionVariant === 'shatter' && phase >= 12 && (
                <div className="shatter-pieces-container">
                  {Array.from({ length: 12 }, (_, i) => {
                    const row = Math.floor(i / 4);
                    const col = i % 4;
                    const angle = Math.random() * 360;
                    const dist = 120 + Math.random() * 180;
                    const tx = Math.cos(angle * Math.PI / 180) * dist;
                    const ty = Math.sin(angle * Math.PI / 180) * dist;
                    const rot = (Math.random() - 0.5) * 360;
                    return (
                      <div
                        key={i}
                        className="shatter-piece"
                        style={{
                          backgroundImage: `url(${avatarSrc})`,
                          backgroundSize: '400% 300%',
                          backgroundPosition: `${col * 33.33}% ${row * 50}%`,
                          left: `${col * 25}%`,
                          top: `${row * 33.33}%`,
                          width: '25%',
                          height: '33.33%',
                          '--shard-tx': `${tx}px`,
                          '--shard-ty': `${ty}px`,
                          '--shard-rot': `${rot}deg`,
                          '--shard-delay': `${i * 30}ms`,
                        } as React.CSSProperties}
                      />
                    );
                  })}
                </div>
              )}
              {/* 人像描边层（在透明头像下方） */}
              {phase >= 11 && phase < 12 && scanVariant === 'outline' && contourPath && (
                <svg
                  className="upgrade-portrait-outline-svg"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <g ref={outlineGroupRef}>
                    <path d={contourPath} className="upgrade-portrait-outline-head" />
                    {Array.from({ length: TRAIL_COUNT - 1 }, (_, i) => (
                      <path key={i} d={contourPath} className="upgrade-portrait-outline-trail" />
                    ))}
                  </g>
                </svg>
              )}
              <img src="/qq-avatar-demo-createsimple/assets/avatar-nobg.png" alt="avatar-nobg" className={`upgrade-avatar-nobg ${flowType === 'full' && phase >= 10 ? 'upgrade-avatar-nobg-show' : ''}`} />
              {/* 大图扫光层 */}
              {phase >= 9 && phase < 10 && <div className="upgrade-shine-sweep" />}
              {/* 人像扫描层：方案一扫光 */}
              {phase >= 11 && scanVariant === 'sweep' && <div className="upgrade-portrait-sweep" />}
            </div>
          </div>
        </div>

        {/* 渗透流程：引言区域（根据 introVariant 切换方案） */}
        {flowType === 'infiltrate' && introVariant === 'replace' && (
          <div className={`infiltrate-intro ${phase >= 6 ? 'infiltrate-intro-hide' : ''}`}>
            <div className={`infiltrate-intro-line ${phase >= 2 && phase < 12 ? 'infiltrate-intro-line-show' : ''} ${phase >= 3 ? 'infiltrate-intro-line-hide' : ''}`}>
              Hi，飞翔的企鹅
            </div>
            <div className={`infiltrate-intro-line ${phase >= 3 && phase < 12 ? 'infiltrate-intro-line-show' : ''} ${phase >= 4 ? 'infiltrate-intro-line-hide' : ''}`}>
              你的头像，已经沉睡很久了
            </div>
            <div className={`infiltrate-intro-line ${phase >= 4 && phase < 12 ? 'infiltrate-intro-line-show' : ''} ${phase >= 5 ? 'infiltrate-intro-line-hide' : ''}`}>
              它其实可以有表情、有动作、有灵魂
            </div>
            <div className={`infiltrate-intro-line ${phase >= 5 && phase < 12 ? 'infiltrate-intro-line-show' : ''}`}>
              现在，让你的专属QQ秀活过来
            </div>
            {/* 唤醒QQ秀按钮 */}
            <button
              className={`infiltrate-awaken-btn-main infiltrate-awaken-btn-solo ${phase >= 5 && phase < 6 ? 'infiltrate-awaken-btn-solo-show' : ''}`}
              onClick={() => {
                setPhase(6); // 脉冲收束 + 粒子同时开始
                setTimeout(() => setPhase(12), 800);
                setTimeout(() => {
                  if (awakenVariant === 'click') {
                    setPhase(13);
                  } else {
                    setPhase(14);
                  }
                }, 2800);
              }}
            >
              <span className="infiltrate-awaken-btn-text">唤醒QQ秀</span>
            </button>
          </div>
        )}
        {flowType === 'infiltrate' && introVariant === 'stack' && (
          <div className={`infiltrate-intro infiltrate-intro-stack ${phase >= 6 ? 'infiltrate-intro-hide' : ''}`}>
            <div className={`infiltrate-intro-stack-line ${phase >= 2 ? 'infiltrate-intro-stack-line-show' : ''}`}>
              Hi，飞翔的企鹅
            </div>
            <div className={`infiltrate-intro-stack-line ${phase >= 3 ? 'infiltrate-intro-stack-line-show' : ''}`}>
              你的头像，已经沉睡很久了
            </div>
            <div className={`infiltrate-intro-stack-line ${phase >= 4 ? 'infiltrate-intro-stack-line-show' : ''}`}>
              它其实可以有表情、有动作、有灵魂
            </div>
            <div className={`infiltrate-intro-stack-line ${phase >= 5 ? 'infiltrate-intro-stack-line-show' : ''}`}>
              现在，让它活过来
            </div>
            {/* 唤醒QQ秀按钮 */}
            <button
              className={`infiltrate-awaken-btn-main infiltrate-awaken-btn-solo infiltrate-awaken-btn-solo-stacked ${phase >= 5 && phase < 6 ? 'infiltrate-awaken-btn-solo-show' : ''}`}
              onClick={() => {
                setPhase(6); // 脉冲收束 + 粒子同时开始
                setTimeout(() => setPhase(12), 800);
                setTimeout(() => {
                  if (awakenVariant === 'click') {
                    setPhase(13);
                  } else {
                    setPhase(14);
                  }
                }, 2800);
              }}
            >
              <span className="infiltrate-awaken-btn-text">唤醒QQ秀</span>
            </button>
          </div>
        )}

        {/* ===== 揭晓沉睡 avatar ===== */}
        {(flowType === 'infiltrate' ? phase >= 6 : phase >= 12) && (() => {
          const activeReveal = flowType === 'infiltrate' ? 'particle' : revealVariant;
          return (
          <div className="reveal-container">
            {/* 方案一：剪影→揭色 */}
            {activeReveal === 'silhouette' && (
              <div className="reveal-silhouette">
                <img src="/qq-avatar-demo-createsimple/assets/sleeping-avatar.png" alt="shadow" className="reveal-silhouette-shadow" />
                <img src="/qq-avatar-demo-createsimple/assets/sleeping-avatar.png" alt="sleeping" className="reveal-silhouette-img" />
              </div>
            )}

            {/* 方案二：光柱降临 */}
            {activeReveal === 'pillar' && (
              <div className="reveal-pillar">
                <div className="reveal-pillar-beam" />
                <img src="/qq-avatar-demo-createsimple/assets/sleeping-avatar.png" alt="sleeping" className="reveal-pillar-img" />
                <div className="reveal-pillar-ripple" />
              </div>
            )}

            {/* 方案三：碎光聚合 */}
            {activeReveal === 'particle' && (
              <div
                className={`reveal-particle ${flowType === 'infiltrate' ? `reveal-particle-${transitionVariant}` : ''} ${flowType === 'infiltrate' && phase === 13 ? 'reveal-particle-clickable' : ''} ${flowType === 'infiltrate' && saveVariant === 'simple' ? 'reveal-particle-simple' : ''}`}
                onClick={flowType === 'infiltrate' && phase === 13 ? () => setPhase(14) : undefined}
              >
                {Array.from({ length: 100 }, (_, i) => {
                  const angle = (i / 100) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
                  const dist = 80 + Math.random() * 140;
                  return (
                    <div
                      key={i}
                      className="reveal-particle-dot"
                      style={{
                        '--p-start-x': `${Math.cos(angle) * dist}px`,
                        '--p-start-y': `${Math.sin(angle) * dist}px`,
                        '--p-delay': `${Math.random() * 1000}ms`,
                        '--p-size': `${4 + Math.random() * 6}px`,
                      } as React.CSSProperties}
                    />
                  );
                })}
                {/* 柔和氛围光效背景层（小人身后） */}
                <div className={`reveal-glow-backdrop ${phase >= 14 ? 'reveal-glow-backdrop-fadeout' : ''}`}>
                  <div className="glow-soft" />
                  <div className="glow-soft glow-soft-2" />
                  <div className="glow-rays" />
                </div>
                {/* gif 第一帧静态图（粒子聚合阶段，gif播放时隐藏） */}
                {flowType === 'infiltrate' ? (
                    <canvas
                      ref={(canvas) => {
                        if (canvas && !canvas.dataset.drawn) {
                          const img = new Image();
                          img.onload = () => {
                            canvas.width = img.width;
                            canvas.height = img.height;
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                              ctx.drawImage(img, 0, 0);
                              canvas.dataset.drawn = '1';
                            }
                          };
                          img.src = '/qq-avatar-demo-createsimple/assets/awaken-ceremony.gif';
                        }
                      }}
                      className={`reveal-awaken-gif reveal-awaken-gif-static ${phase >= 14 ? 'reveal-awaken-gif-static-hide' : ''}`}
                    />
                ) : (
                  <canvas
                    ref={(canvas) => {
                      if (canvas && !canvas.dataset.drawn) {
                        const img = new Image();
                        img.onload = () => {
                          canvas.width = img.width;
                          canvas.height = img.height;
                          const ctx = canvas.getContext('2d');
                          if (ctx) {
                            ctx.drawImage(img, 0, 0);
                            canvas.dataset.drawn = '1';
                          }
                        };
                        img.src = '/qq-avatar-demo-createsimple/assets/awaken-ceremony.gif';
                      }
                    }}
                    className="reveal-awaken-gif reveal-awaken-gif-static"
                  />
                )}
                {/* 粒子效果结束后播放完整 gif（phase 14 开始，播完停留在最后一帧） */}
                {flowType === 'infiltrate' && phase >= 14 && (
                  <div
                    ref={(el) => {
                      if (el && !gifCreatedRef.current) {
                        gifCreatedRef.current = true;
                        const img = document.createElement('img');
                        img.src = `/qq-avatar-demo-createsimple/assets/awaken-ceremony.gif?t=${Date.now()}`;
                        img.alt = 'awaken';
                        img.style.width = '100%';
                        img.style.height = '100%';
                        el.appendChild(img);
                      }
                    }}
                    className="reveal-awaken-gif reveal-awaken-gif-play"
                  />
                )}

                {/* 唤醒氛围效果 */}
                {awakenAmbience && (
                  <div className="awaken-ambience">
                    {/* 光环爆发 */}
                    <div className="awaken-ring-burst" />
                    <div className="awaken-ring-burst awaken-ring-burst-2" />
                    {/* 底部柔光晕 */}
                    <div className="awaken-ground-glow" />
                    {/* 飘散星屑 */}
                    {Array.from({ length: 20 }, (_, i) => {
                      const left = 15 + Math.random() * 70;
                      const delay = Math.random() * 3000;
                      const duration = 2500 + Math.random() * 2000;
                      const size = 3 + Math.random() * 5;
                      const drift = (Math.random() - 0.5) * 40;
                      return (
                        <div
                          key={`star-${i}`}
                          className="awaken-star"
                          style={{
                            '--star-left': `${left}%`,
                            '--star-delay': `${delay}ms`,
                            '--star-duration': `${duration}ms`,
                            '--star-size': `${size}px`,
                            '--star-drift': `${drift}px`,
                          } as React.CSSProperties}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 维度选项卡片（仅长流程） */}
            {flowType === 'full' && phase >= 13 && (
              <div className="reveal-dimensions">
                {SOUL_DIMENSIONS.map((dim, idx) => (
                  <div
                    key={dim.key}
                    className={`reveal-dim-card reveal-dim-card-${dim.side} ${dim.filled ? 'reveal-dim-card-filled' : 'reveal-dim-card-unfilled'}`}
                    style={{ '--dim-index': idx } as React.CSSProperties}
                    onClick={() => console.log('click dimension:', dim.key)}
                  >
                    <svg className="reveal-dim-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      {dim.key === 'appearance' && (
                        <path d="M8 1.5C4.41 1.5 1.5 4.41 1.5 8s2.91 6.5 6.5 6.5 6.5-2.91 6.5-6.5S11.59 1.5 8 1.5zm0 2a2.5 2.5 0 110 5 2.5 2.5 0 010-5zm0 9.5c-1.83 0-3.44-.84-4.52-2.14C4.68 9.8 6.33 9.25 8 9.25s3.32.55 4.52 1.61A5.47 5.47 0 018 13z" fill="currentColor"/>
                      )}
                      {dim.key === 'personality' && (
                        <path d="M8 1.5l1.54 4.74h4.98l-4.03 2.93 1.54 4.74L8 10.98l-4.03 2.93 1.54-4.74L1.48 6.24h4.98L8 1.5z" fill="currentColor"/>
                      )}
                      {dim.key === 'catchphrase' && (
                        <path d="M2 3.5A1.5 1.5 0 013.5 2h9A1.5 1.5 0 0114 3.5v7a1.5 1.5 0 01-1.5 1.5H5l-3 2.5V12h-.5A1.5 1.5 0 010 10.5v-7z" fill="currentColor" transform="translate(1,0.5)"/>
                      )}
                      {dim.key === 'voice' && (
                        <path d="M8 1v14M5 3.5v9M11 3.5v9M3 5.5v5M13 5.5v5M1 7v2M15 7v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      )}
                    </svg>
                    <span className="reveal-dim-label">{dim.label}</span>
                    <span className="reveal-dim-status">{dim.filled ? dim.value : '待填写'}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 操作按钮 */}
            {phase >= 13 && !(flowType === 'infiltrate' && awakenVariant === 'auto' && phase < 15) && !(flowType === 'infiltrate' && phase >= 14 && phase < 15) && (
              <div className="reveal-actions">
                {flowType === 'full' && (
                  <button className="reveal-regenerate-btn" onClick={() => console.log('regenerate')}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M3.5 10a6.5 6.5 0 0111.48-4.17M16.5 10a6.5 6.5 0 01-11.48 4.17" stroke="rgba(0,0,0,0.4)" strokeWidth="1.8" strokeLinecap="round"/>
                      <path d="M15 3v3h-3M5 17v-3h3" stroke="rgba(0,0,0,0.4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
                {flowType === 'infiltrate' ? (
                  phase < 14 ? (
                    <span className="infiltrate-awaken-link" onClick={() => setPhase(14)}>
                      点击唤醒
                    </span>
                  ) : null
                ) : (
                  <button className="reveal-soul-btn" onClick={() => console.log('inject soul')}>
                    <span className="reveal-soul-btn-text">注入灵魂</span>
                    <span className="reveal-soul-btn-sparkle">✦</span>
                  </button>
                )}
              </div>
            )}

            {/* gif 播放完成后：操作面板 */}
            {flowType === 'infiltrate' && phase >= 15 && saveVariant === 'simple' && (
              <div className="reveal-save-action">
                <div className="reveal-save-action-row">
                  <button className="reveal-tweak-btn" onClick={() => setShopOpen(true)}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M5.82613 1.51352C5.75306 1.3757 5.55561 1.3757 5.48254 1.51352L4.44165 3.4768L2.47836 4.5177C2.34055 4.59077 2.34055 4.78822 2.47836 4.86128L4.44165 5.90218L5.48254 7.86546C5.55561 8.00328 5.75306 8.00328 5.82613 7.86546L6.86702 5.90218L8.83031 4.86128C8.96813 4.78822 8.96813 4.59077 8.83031 4.5177L6.86702 3.4768L5.82613 1.51352Z" fill="#1A1A1A"/>
                      <path d="M19.1116 15.5531C19.0386 15.4153 18.8411 15.4153 18.768 15.5531L18.0935 16.8254L16.8211 17.5C16.6833 17.573 16.6833 17.7705 16.8211 17.8436L18.0935 18.5181L18.768 19.7905C18.8411 19.9283 19.0386 19.9283 19.1116 19.7905L19.7862 18.5181L21.0585 17.8436C21.1964 17.7705 21.1964 17.573 21.0585 17.5L19.7862 16.8254L19.1116 15.5531Z" fill="#1A1A1A"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M15.4888 3.45647C16.3229 2.62242 17.6752 2.62242 18.5092 3.45647L20.3275 5.27474C21.1615 6.10879 21.1615 7.46105 20.3275 8.2951L8.50869 20.1139C7.67464 20.9479 6.32238 20.9479 5.48834 20.1139L3.67006 18.2956C2.83601 17.4616 2.83601 16.1093 3.67006 15.2753L15.4888 3.45647ZM17.3071 4.65855C17.137 4.48839 16.8611 4.48839 16.6909 4.65855L15.7768 5.57269L18.2113 8.00715L19.1254 7.09302C19.2956 6.92286 19.2956 6.64698 19.1254 6.47682L17.3071 4.65855ZM17.0092 9.20924L14.5747 6.77477L4.87214 16.4773C4.70199 16.6475 4.70199 16.9234 4.87214 17.0935L6.69042 18.9118C6.86057 19.082 7.13645 19.082 7.30661 18.9118L17.0092 9.20924Z" fill="#1A1A1A"/>
                    </svg>
                  </button>
                  <button className="reveal-save-btn" onClick={handleSave}>
                    <span className="reveal-save-btn-text">保存QQ秀</span>
                  </button>
                </div>
                <div className="reveal-save-hint">
                  <span className="reveal-save-hint-text">将展示在聊天页、侧边栏、资料页</span>
                  <span className="reveal-save-hint-link">更改设置</span>
                </div>
              </div>
            )}
            {flowType === 'infiltrate' && phase >= 15 && saveVariant === 'edit' && (
              <div className="reveal-done-panel">
                {/* 再次生成 + 编辑形象 */}
                <div className="reveal-edit-actions">
                  <button className="reveal-edit-btn" onClick={() => console.log('regenerate')}>
                    <img className="reveal-edit-btn-avatar" src={avatarSrc} alt="avatar" />
                    <span className="reveal-edit-btn-text">再次生成</span>
                  </button>
                  <button className="reveal-edit-btn" onClick={() => console.log('edit avatar')}>
                    <svg className="reveal-edit-btn-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M4.856 1.262a.16.16 0 00-.286 0L3.703 2.898l-1.636.867a.16.16 0 000 .286l1.636.868.867 1.636a.16.16 0 00.286 0l.868-1.636 1.636-.868a.16.16 0 000-.286l-1.636-.867-.868-1.636z" fill="rgba(0,0,0,0.9)"/>
                      <path d="M15.928 12.962a.16.16 0 00-.287 0l-.562 1.06-1.06.562a.16.16 0 000 .286l1.06.562.562 1.06a.16.16 0 00.287 0l.562-1.06 1.06-.562a.16.16 0 000-.286l-1.06-.562-.562-1.06z" fill="rgba(0,0,0,0.9)"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M12.909 2.881a1.78 1.78 0 012.517 0l1.515 1.515a1.78 1.78 0 010 2.517L7.092 16.762a1.78 1.78 0 01-2.517 0L3.06 15.247a1.78 1.78 0 010-2.517l9.849-9.849zm1.515 1.001a.5.5 0 00-.514.118l-.762.762 2.029 2.029.762-.762a.5.5 0 000-.513l-1.515-1.515v-.119zm-.748 3.793l-2.029-2.029-8.085 8.086a.5.5 0 000 .513l1.515 1.515a.5.5 0 00.514 0l8.085-8.085z" fill="rgba(0,0,0,0.9)"/>
                    </svg>
                    <span className="reveal-edit-btn-text">编辑形象</span>
                  </button>
                </div>
                {/* 保存形象大按钮 */}
                <button className="reveal-save-btn-full" onClick={handleSave}>
                  <span className="reveal-save-btn-full-text">保存形象</span>
                  </button>
                {/* 底部提示 */}
                <div className="reveal-save-hint">
                  <span className="reveal-save-hint-text">将展示在聊天页、侧边栏、资料页</span>
                  <span className="reveal-save-hint-link">更改设置</span>
                </div>
              </div>
            )}
          </div>
          );
        })()}

        <div className={`upgrade-action-area ${flowType === 'full' && phase >= 5 && phase < 7 ? 'upgrade-action-show' : ''}`}>
          <button className="upgrade-start-btn" onClick={handleStartUpgrade}>
            <span className="upgrade-btn-text">开始升级</span>
            <span className="upgrade-btn-sparkle">✦</span>
          </button>
          <div className="upgrade-skip" onClick={handleClose}>以后再说</div>
        </div>

        {/* 进度文案 */}
        {flowType === 'full' && phase >= 9 && phase < 12 && (
          <div className="upgrade-progress-status" key={phase >= 11 ? `p11-${progressIdx}` : 'extract'}>
            <svg className="upgrade-progress-star" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 0L9.6 6.4L16 8L9.6 9.6L8 16L6.4 9.6L0 8L6.4 6.4L8 0Z" fill="#0099FF" />
            </svg>
            <span className="upgrade-progress-text">
              {phase >= 11 ? PROGRESS_TEXTS_P11[progressIdx] : PROGRESS_TEXTS_P9[0]}
              <span className="upgrade-progress-dots">{'.'.repeat(dotCount)}</span>
            </span>
          </div>
        )}

      </div>
    </div>

    {/* ========== 飞行小人（fly-out 方案） ========== */}
    {savingFlyout && (
      <div className="save-fly-avatar">
        <img src="/qq-avatar-demo-createsimple/assets/awaken-last-frame.png" alt="fly" className="save-fly-avatar-img" />
      </div>
    )}

    {/* ========== 编辑QQ秀商城（全屏 926px，从右侧滑入） ========== */}
    <div className={`shop-panel ${shopOpen ? 'shop-panel-open' : ''}`}>
      {/* 导航栏（top:44 状态栏下方） */}
      <div className="shop-header">
        <div className="shop-back" onClick={() => setShopOpen(false)}>
          <img src="/qq-avatar-demo-createsimple/assets/shop/4.svg" alt="back" width="24" height="24" />
        </div>
        <span className="shop-title">编辑QQ秀</span>
        <button className="shop-save-btn">保存</button>
      </div>

      {/* 形象预览（居中） */}
      <div className="shop-avatar-zone">
        <img src="/qq-avatar-demo-createsimple/assets/awaken-last-frame.png" alt="avatar" className="shop-avatar-canvas" />
        <img src="/qq-avatar-demo-createsimple/assets/shop/17.png" alt="" className="shop-avatar-shadow" />
      </div>

      {/* 右侧工具条 */}
      <div className="shop-tools">
        <img src="/qq-avatar-demo-createsimple/assets/shop/5.svg" alt="" className="shop-tool-icon" />
        <img src="/qq-avatar-demo-createsimple/assets/shop/6.svg" alt="" className="shop-tool-icon" />
      </div>

      {/* 重新生成按钮 */}
      <div className="shop-regen-btn">
        <img src="/qq-avatar-demo-createsimple/assets/shop/regen-icon.svg" alt="" width="18" height="18" />
        <span>重新生成</span>
      </div>

      {/* 底部商城 */}
      <div className="shop-bottom">
        <div className="shop-tabs">
          <div className="shop-tab" onClick={() => setShopActiveTab('捏脸')}>
            <span className={shopActiveTab === '捏脸' ? 'shop-tab-text-active' : 'shop-tab-text'}>捏脸</span>
            <div className={`shop-tab-bar ${shopActiveTab === '捏脸' ? 'shop-tab-bar-show' : ''}`} />
          </div>
          <div className="shop-tab" onClick={() => setShopActiveTab('装扮')}>
            <span className={shopActiveTab === '装扮' ? 'shop-tab-text-active' : 'shop-tab-text'}>装扮</span>
            <div className={`shop-tab-bar ${shopActiveTab === '装扮' ? 'shop-tab-bar-show' : ''}`} />
          </div>
        </div>
        <div className="shop-sub-cats">
          {['套装', '上装', '下装', '鞋子', '配饰'].map(cat => (
            <div key={cat} className={`shop-sub-cat ${shopActiveCategory === cat ? 'shop-sub-cat-active' : ''}`} onClick={() => setShopActiveCategory(cat)}>{cat}</div>
          ))}
        </div>
        <div className="shop-items">
          {[8, 9, 10, 11, 12, 13, 14, 15, 16].map(n => (
            <div key={n} className="shop-item">
              <div className="shop-item-thumb">
                <img src={`/qq-avatar-demo-createsimple/assets/shop/${n}.png`} alt="" />
              </div>
              {n <= 10 && <div className="shop-item-label"><span className="shop-item-svip">SVIP</span><span className="shop-item-free">免费</span></div>}
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};

export default AvatarUpgrade;

export interface VipBadge {
  type: 'svip' | 'bigvip' | 'vip';
  level: string;
  icon: string;        // 左侧小图标
  sideIcon: string;    // 侧面描边图标
}

export interface MessageItemData {
  avatar: string;
  avatarType?: 'svg' | 'img';
  name: string;
  nameColor?: string;
  nameGradient?: string;
  vipBadge?: VipBadge;
  decorIcons?: string[];   // 昵称后面的装饰图标（如勋章等）
  separatorIcon?: string;  // 装饰图标分隔符
  time: string;
  message: string;
  prefix?: string;         // 消息前缀，如 "[有人@我]"
  prefixColor?: string;
  countPrefix?: string;    // 如 "[23条]"
  senderPrefix?: string;   // 发送者前缀如 "liqiang: "
  badgeCount?: number;     // 数字红点
  hasDot?: boolean;        // 小红点（无数字）
  muteIcon?: string;       // 免打扰图标
  groupAvatar?: boolean;   // 是否为群头像
  groupImages?: string[];  // 群头像图片（4宫格）
  extraIcon?: string;      // 消息预览行右侧图标
  opacitySubtext?: boolean;  // 副文本是否半透明
  customAvatar?: string | boolean;  // 自定义头像类型
}

const assetBase = '/assets/CodeBuddyAssets/4337_29293';

export const messageData: MessageItemData[] = [
  {
    avatar: `${assetBase}/9.svg`,
    avatarType: 'svg',
    name: '飞翔企鹅',
    nameColor: '#D09B49',
    vipBadge: {
      type: 'svip',
      level: 'SVIP3',
      icon: `${assetBase}/1.svg`,
      sideIcon: `${assetBase}/2.svg`,
    },
    decorIcons: [
      `${assetBase}/5.svg`,
      `${assetBase}/6.svg`,
      `${assetBase}/7.svg`,
      `${assetBase}/8.svg`,
      `${assetBase}/46.svg`,
    ],
    separatorIcon: `${assetBase}/4.svg`,
    time: '22:15',
    message: '我打算下周去武大看樱花呢',
    badgeCount: 3,
  },
  {
    avatar: `${assetBase}/3.svg`,
    avatarType: 'svg',
    name: '杰徳陈',
    nameGradient: 'linear-gradient(180deg, rgba(255,72,75,1) 0%, rgba(255,183,0,1) 54%, rgba(0,225,255,1) 100%)',
    vipBadge: {
      type: 'bigvip',
      level: '大VIP3',
      icon: `${assetBase}/10.svg`,
      sideIcon: `${assetBase}/4.svg`,
    },
    decorIcons: [
      `${assetBase}/12.svg`,
      `${assetBase}/13.svg`,
      `${assetBase}/14.svg`,
      `${assetBase}/15.svg`,
      `${assetBase}/16.svg`,
    ],
    separatorIcon: `${assetBase}/4.svg`,
    time: '21:32',
    message: '还可以吧我觉得，有条件的话还是可以多尝试一下',
    badgeCount: 2,
    extraIcon: `${assetBase}/17.svg`,
  },
  {
    avatar: `${assetBase}/11.svg`,
    avatarType: 'svg',
    name: 'liqiang',
    nameColor: '#F74C30',
    vipBadge: {
      type: 'vip',
      level: 'VIP3',
      icon: `${assetBase}/18.svg`,
      sideIcon: `${assetBase}/5.svg`,
    },
    time: '21:11',
    message: '最近的文档要去哪里下载，你能不能发一份给我',
  },
  {
    avatar: `${assetBase}/20.svg`,
    avatarType: 'svg',
    name: 'QQ邮箱',
    time: '21:03',
    message: 'QQ音乐项目组：恭喜你成功开通超级会员',
  },
  {
    avatar: `${assetBase}/6.svg`,
    avatarType: 'svg',
    name: '红点降噪',
    decorIcons: [`${assetBase}/48.svg`],
    time: '21:00',
    message: 'liqiang: 我觉得这里还可以再看看。 ',
    senderPrefix: '[语音通话] ',
    muteIcon: `${assetBase}/22.svg`,
    groupAvatar: true,
  },
  {
    avatar: `${assetBase}/12.svg`,
    avatarType: 'svg',
    name: '南极设计组',
    time: '20:15',
    message: 'liqiang: [发起了位置共享]',
    muteIcon: `${assetBase}/23.svg`,
    groupAvatar: true,
  },
  {
    avatar: `${assetBase}/13.svg`,
    avatarType: 'svg',
    name: '消息列表降噪讨论',
    decorIcons: [`${assetBase}/49.svg`],
    time: '19:55',
    message: '[语音通话] liqiang: 我觉得这里还可以再看看。 ',
    muteIcon: `${assetBase}/22.svg`,
    groupAvatar: true,
  },
  {
    avatar: `${assetBase}/25.svg`,
    avatarType: 'svg',
    name: '腾讯新闻',
    time: '19:50',
    message: '极越汽车宣布原地解散社保停缴，怀孕员工崩溃。',
  },
  {
    avatar: `${assetBase}/7.svg`,
    avatarType: 'svg',
    name: '元梦之星',
    decorIcons: [`${assetBase}/32.svg`],
    time: '19:48',
    message: 'liqiang: 有没有人一起开黑啊',
    countPrefix: '[23条]',
    hasDot: true,
    muteIcon: `${assetBase}/29.svg`,
  },
  {
    avatar: `${assetBase}/8.svg`,
    avatarType: 'svg',
    name: '无限暖暖',
    decorIcons: [`${assetBase}/32.svg`],
    time: '19:48',
    prefix: '[新置顶] ',
    prefixColor: '#F74C30',
    message: 'liqiang: 我觉得这里还可以再看看。 ',
    hasDot: true,
    muteIcon: `${assetBase}/33.svg`,
  },
  {
    avatar: `${assetBase}/34.svg`,
    avatarType: 'svg',
    name: 'QQ运动',
    time: '19:50',
    message: 'lisa获得今日运动冠军',
  },
  {
    avatar: `${assetBase}/51.png`,
    avatarType: 'img',
    name: 'Hazel',
    nameColor: 'rgba(0,0,0,0.90)',
    time: '19:40',
    message: '嗯嗯，我看到了～',
  },
  {
    avatar: `${assetBase}/54.png`,
    avatarType: 'img',
    name: '黑神话悟空- QQ游戏',
    nameColor: 'rgba(0,0,0,0.90)',
    time: '19:15',
    message: 'liqiang: 我觉得这里还可以再看看。 ',
    hasDot: true,
  },
  {
    avatar: '',
    avatarType: 'svg',
    name: '公众号',
    nameColor: 'rgba(0,0,0,0.90)',
    time: '18:55',
    message: 'QQ手游：快回归见证幸福，赢大额红包',
    customAvatar: true,
  },
  {
    avatar: '',
    avatarType: 'img',
    name: '杰德陈、liqiang、weiwei、Shasha、Heze l',
    nameColor: 'rgba(0,0,0,0.90)',
    time: '18:55',
    prefix: '[有人@我] ',
    prefixColor: '#F74C30',
    countPrefix: '[21条]',
    message: 'Foxe: 今晚对齐下视觉吧?',
    hasDot: true,
    groupAvatar: true,
    groupImages: [
      `${assetBase}/55.png`,
      `${assetBase}/57.png`,
      `${assetBase}/56.png`,
      `${assetBase}/58.png`,
    ],
  },
  {
    avatar: `${assetBase}/59.png`,
    avatarType: 'img',
    name: '阿文',
    nameColor: 'rgba(0,0,0,0.90)',
    time: '18:42',
    message: '文件的demo我已经更新了，你有空看一下',
    badgeCount: 3,
  },
  {
    avatar: '',
    avatarType: 'svg',
    name: '折叠的群聊',
    nameColor: 'rgba(0,0,0,0.90)',
    time: '18:30',
    countPrefix: '[12条]',
    opacitySubtext: true,
    message: 'iOS核心体验: 还可以，这里的体验做的不错',
    customAvatar: 'folder',
  },
  {
    avatar: `${assetBase}/51.png`,
    avatarType: 'img',
    name: '老妈',
    time: '18:20',
    message: '晚上回来吃饭吗？做了你爱吃的红烧排骨',
    badgeCount: 1,
  },
  {
    avatar: `${assetBase}/54.png`,
    avatarType: 'img',
    name: '发小-阿杰',
    time: '18:15',
    message: '周末打篮球不？叫上老王他们凑一队',
    badgeCount: 2,
  },
  {
    avatar: `${assetBase}/55.png`,
    avatarType: 'img',
    name: '室友群',
    time: '18:10',
    message: '谁的外卖到了？放门口了帮忙拿一下',
    badgeCount: 5,
    groupAvatar: true,
    groupImages: [
      `${assetBase}/55.png`,
      `${assetBase}/56.png`,
      `${assetBase}/57.png`,
      `${assetBase}/58.png`,
    ],
  },
  {
    avatar: `${assetBase}/56.png`,
    avatarType: 'img',
    name: '奶茶搭子',
    time: '18:05',
    message: '新出的杨枝甘露好好喝！你要不要来一杯',
    badgeCount: 1,
  },
  {
    avatar: `${assetBase}/57.png`,
    avatarType: 'img',
    name: '小鹿',
    time: '17:58',
    message: '刚看到一只超可爱的柯基！发你看看🐶',
    badgeCount: 3,
  },
  {
    avatar: `${assetBase}/58.png`,
    avatarType: 'img',
    name: '表姐',
    time: '17:50',
    message: '下个月我结婚你一定要来啊！给你留了伴郎位',
    badgeCount: 1,
  },
  {
    avatar: `${assetBase}/59.png`,
    avatarType: 'img',
    name: '快递驿站',
    time: '17:45',
    message: '您有一个快递已到站，取件码 8-2-5067',
    badgeCount: 1,
  },
  {
    avatar: `${assetBase}/9.svg`,
    avatarType: 'svg',
    name: '火锅群',
    time: '17:40',
    message: '今晚海底捞走起！我已经排号了，前面还有3桌',
    badgeCount: 8,
    groupAvatar: true,
  },
  {
    avatar: `${assetBase}/11.svg`,
    avatarType: 'svg',
    name: '老爸',
    time: '17:35',
    message: '钓了条大鲈鱼，回来给你做酸菜鱼',
    badgeCount: 1,
  },
  {
    avatar: `${assetBase}/20.svg`,
    avatarType: 'svg',
    name: '健身打卡群',
    time: '17:30',
    message: '今天有人去跑步吗？天气挺好的一起约',
    badgeCount: 4,
    groupAvatar: true,
  },
  {
    avatar: `${assetBase}/6.svg`,
    avatarType: 'svg',
    name: '隔壁班小王',
    time: '17:25',
    message: '你家猫又跑到我阳台上来了😂快来领走',
    badgeCount: 2,
  },
  {
    avatar: `${assetBase}/12.svg`,
    avatarType: 'svg',
    name: '游戏开黑群',
    time: '17:20',
    message: '三缺一！就等你了快上线',
    badgeCount: 6,
    groupAvatar: true,
  },
  {
    avatar: `${assetBase}/13.svg`,
    avatarType: 'svg',
    name: '大学同学群',
    time: '17:15',
    message: '老班长发红包了，手慢无！',
    badgeCount: 3,
    groupAvatar: true,
  },
  {
    avatar: `${assetBase}/25.svg`,
    avatarType: 'svg',
    name: '天气提醒',
    time: '17:10',
    message: '明天降温10度，记得穿厚点别感冒了🧣',
    badgeCount: 1,
  },
  {
    avatar: `${assetBase}/34.svg`,
    avatarType: 'svg',
    name: '美团外卖',
    time: '17:05',
    message: '您的订单已送达，祝您用餐愉快！',
    badgeCount: 1,
  },
  {
    avatar: `${assetBase}/3.svg`,
    avatarType: 'svg',
    name: '闺蜜-甜甜',
    time: '17:00',
    message: '这周六逛街吗？新开了一家vintage店超好逛',
    badgeCount: 2,
  },
  {
    avatar: `${assetBase}/7.svg`,
    avatarType: 'svg',
    name: '邻居张阿姨',
    time: '16:55',
    message: '家里包了饺子，给你送一盘过来哈',
    badgeCount: 1,
  },
  {
    avatar: `${assetBase}/8.svg`,
    avatarType: 'svg',
    name: '追剧搭子',
    time: '16:50',
    message: '新一集更新了！你看了吗结局也太意外了吧',
    badgeCount: 1,
  },
];

// ========== 情绪反应消息系统 ==========

export type EmotionType =
  | 'shy'          // 害羞
  | 'excited'      // 激动
  | 'scared'       // 害怕
  | 'curious'      // 好奇
  | 'anticipation' // 期待
  | 'happy'        // 开心
  | 'love'         // 心动
  | 'surprised'    // 惊讶
  | 'bored'        // 无聊
  | 'touched';     // 感动

export interface EmotionMessageItemData extends MessageItemData {
  emotion: EmotionType;
}

const assetBasePath = '/assets/CodeBuddyAssets/4337_29293';

export const emotionMessageData: EmotionMessageItemData[] = [
  {
    avatar: `${assetBasePath}/51.png`,
    avatarType: 'img',
    name: '小鹿',
    time: '23:05',
    message: '那个…我其实一直想跟你说…算了没什么😳',
    badgeCount: 1,
    emotion: 'shy',
  },
  {
    avatar: `${assetBasePath}/54.png`,
    avatarType: 'img',
    name: '阿杰',
    time: '23:02',
    message: '我们的项目拿到最佳设计奖了！！！🎉🎉🎉',
    badgeCount: 5,
    emotion: 'excited',
  },
  {
    avatar: `${assetBasePath}/55.png`,
    avatarType: 'img',
    name: '深夜电台',
    time: '22:58',
    message: '你听说了吗，隔壁楼昨晚停电后有人听到奇怪的声音…',
    badgeCount: 1,
    emotion: 'scared',
  },
  {
    avatar: `${assetBasePath}/56.png`,
    avatarType: 'img',
    name: '科技宅小明',
    time: '22:55',
    message: '我发现一个超隐蔽的彩蛋，你绝对想不到在哪里🤔',
    badgeCount: 2,
    emotion: 'curious',
  },
  {
    avatar: `${assetBasePath}/57.png`,
    avatarType: 'img',
    name: '旅行计划群',
    time: '22:50',
    message: '机票已订好！下周五出发去冰岛看极光✈️',
    badgeCount: 8,
    emotion: 'anticipation',
  },
  {
    avatar: `${assetBasePath}/58.png`,
    avatarType: 'img',
    name: '奶茶妹妹',
    time: '22:45',
    message: '刚发现楼下新开了一家猫咖，超多小猫咪🐱太幸福了',
    badgeCount: 3,
    emotion: 'happy',
  },
  {
    avatar: `${assetBasePath}/59.png`,
    avatarType: 'img',
    name: '星星',
    time: '22:40',
    message: '今天的晚霞好美，让我想起了我们一起看日落的那天🌅',
    badgeCount: 1,
    emotion: 'love',
  },
  {
    avatar: `${assetBasePath}/9.svg`,
    avatarType: 'svg',
    name: '快递小哥',
    time: '22:35',
    message: '您有一件到付国际包裹，金额：¥9999.00，请确认签收',
    badgeCount: 1,
    emotion: 'surprised',
  },
  {
    avatar: `${assetBasePath}/3.svg`,
    avatarType: 'svg',
    name: '工作群-周报',
    time: '22:30',
    message: '本周无新消息，下周也没有安排，继续摸鱼',
    badgeCount: 1,
    emotion: 'bored',
  },
  {
    avatar: `${assetBasePath}/11.svg`,
    avatarType: 'svg',
    name: '老妈',
    time: '22:25',
    message: '孩子，冰箱里给你留了排骨汤，记得热了再喝❤️',
    badgeCount: 1,
    emotion: 'touched',
  },
  {
    avatar: `${assetBasePath}/20.svg`,
    avatarType: 'svg',
    name: '闺蜜团',
    time: '22:20',
    message: '姐妹们这周末密室逃脱走起！听说新出了一个恐怖主题😱',
    badgeCount: 12,
    emotion: 'scared',
  },
  {
    avatar: `${assetBasePath}/6.svg`,
    avatarType: 'svg',
    name: '暗恋对象',
    time: '22:15',
    message: '在吗？我有话想当面跟你说，明天方便见一面吗',
    badgeCount: 1,
    emotion: 'shy',
  },
  {
    avatar: `${assetBasePath}/12.svg`,
    avatarType: 'svg',
    name: '游戏战队',
    time: '22:10',
    message: '冲冲冲！赛季最后一天了，今晚必须上王者！🔥',
    badgeCount: 6,
    emotion: 'excited',
  },
  {
    avatar: `${assetBasePath}/13.svg`,
    avatarType: 'svg',
    name: '读书会',
    time: '22:05',
    message: '这本书的结局反转太震撼了，我整个人都愣住了',
    badgeCount: 2,
    emotion: 'surprised',
  },
  {
    avatar: `${assetBasePath}/25.svg`,
    avatarType: 'svg',
    name: '天气助手',
    time: '22:00',
    message: '明天有流星雨🌠，最佳观赏时间凌晨2点，要去看吗',
    badgeCount: 1,
    emotion: 'anticipation',
  },
];

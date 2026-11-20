export type Lang = 'zh' | 'en'

export interface Stat {
  value: string
  label: string
}

export interface ListItem {
  n: string
  title: string
  text: string
}

export interface Dictionary {
  meta: { title: string; description: string }
  nav: { research: string; team: string; manufacturing: string; contact: string }
  hero: {
    eyebrow: string
    titleA: string
    titleB: string
    lead: string
    body: string
    ctaPrimary: string
    ctaSecondary: string
  }
  marquee: string[]
  stats: Stat[]
  research: { eyebrow: string; title: string; body: string; items: ListItem[] }
  team: {
    eyebrow: string
    title: string
    groups: ListItem[]
    quote: string
  }
  manufacturing: { eyebrow: string; title: string; body: string; items: ListItem[] }
  vision: { eyebrow: string; title: string; body: string }
  contact: { eyebrow: string; title: string }
  footer: string
}

export const translations: Record<Lang, Dictionary> = {
  zh: {
    meta: {
      title: '迅洲科技 AccelJoy Tech | AI 与机器人公司',
      description:
        '迅洲科技研究机器人与人工智能。团队来自清华、耶鲁、剑桥，家里做了 30 年工厂与进出口生意。我们做能被制造出来、卖得出去的智能系统。',
    },
    nav: {
      research: '研究方向',
      team: '团队',
      manufacturing: '制造与贸易',
      contact: '联系',
    },
    hero: {
      eyebrow: '人工智能 · 机器人 · 制造',
      titleA: '迅洲科技',
      titleB: 'ACCELJOY TECH',
      lead: '我们把 AI 装进机器，再让机器走进产线。',
      body: '迅洲科技研究具身智能与机器人系统。团队来自清华、耶鲁、剑桥；家里做了 30 年工厂生产与进出口生意。论文和出货之间隔着什么，我们一清二楚——那正是我们的主场。',
      ctaPrimary: '聊聊合作',
      ctaSecondary: '看看我们在做什么',
    },
    marquee: ['具身智能', '机器人系统', '感知与控制', '智能制造', '全球交付'],
    stats: [
      { value: '30', label: '年 · 制造与进出口经验' },
      { value: '3', label: '所 · 清华、耶鲁、剑桥' },
      { value: '1', label: '条主线 · 让 AI 走进物理世界' },
    ],
    research: {
      eyebrow: '研究',
      title: '我们在做什么',
      body: '不追热点，也不堆名词。目标只有一条：让 AI 在物理世界里站得稳、拿得准、做得久。',
      items: [
        {
          n: '01',
          title: '具身智能',
          text: '感知、决策、执行。让智能体在真实任务里自己想办法——不是演示视频里的完美环境，是有灰尘、有偏差、有干扰的产线。',
        },
        {
          n: '02',
          title: '机器人系统',
          text: '把感知、控制、安全和机械结构接成一整套。单个模块跑分好看只是起点，整套系统长期稳定才算数。',
        },
        {
          n: '03',
          title: '从样机到产品',
          text: '实验室里能跑，和车间里能用，中间隔着材料、装配、成本、良率。这段路，我们走了 30 年。',
        },
      ],
    },
    team: {
      eyebrow: '团队',
      title: '一支队伍，两种母语：论文，和车间。',
      groups: [
        {
          n: 'A',
          title: '研究这一面',
          text: '清华、耶鲁、剑桥——对难题的品味，在实验室里练出来。',
        },
        {
          n: 'B',
          title: '产业这一面',
          text: '30 年工厂生产与进出口——判断力，在产线和货柜边上练出来。',
        },
      ],
      quote: '论文告诉我们什么可能，车间告诉我们什么可行。',
    },
    manufacturing: {
      eyebrow: '制造与贸易',
      title: '技术要落地，先得造得出来。',
      body: '样机好看不难，难的是量产：良率、成本、供应链、交期，然后过海关、到地球另一边的货架上。这些环节我们熟——不是调研来的，是一单一单做出来的。',
      items: [
        {
          n: '01',
          title: '工厂直觉',
          text: '可靠性、材料、装配上的坑，提前就能看见——因为踩过、修过。',
        },
        {
          n: '02',
          title: '全球贸易',
          text: '进出口流程、国际客户、交付链路，都是熟路。',
        },
        {
          n: '03',
          title: '技术转化',
          text: '每个方向先过三道题：造得出来吗？客户用得起吗？出了问题修得好吗？',
        },
      ],
    },
    vision: {
      eyebrow: '愿景',
      title: '智能机器，不该只活在演示视频里。',
      body: '我们想让它们走进工厂和日常生活——可靠、耐用，并且一代比一代更强。',
    },
    contact: {
      eyebrow: '联系',
      title: '合作、媒体、投资——欢迎来信。',
    },
    footer: 'AI 与机器人研究，为落地而生。',
  },
  en: {
    meta: {
      title: 'AccelJoy Tech | AI & Robotics Company',
      description:
        'AccelJoy Tech works on robotics and AI. The team spans Tsinghua, Yale and Cambridge, with 30 years of manufacturing and import-export behind it. We build intelligent systems that can actually be made and sold.',
    },
    nav: {
      research: 'Research',
      team: 'Team',
      manufacturing: 'Manufacturing',
      contact: 'Contact',
    },
    hero: {
      eyebrow: 'AI · Robotics · Manufacturing',
      titleA: 'AccelJoy Tech',
      titleB: '迅洲科技',
      lead: 'We put AI into machines — and machines onto the factory floor.',
      body: 'AccelJoy Tech researches embodied intelligence and robotic systems. Our team came out of Tsinghua, Yale and Cambridge; our family has run factories and cross-border trade for 30 years. We know exactly what stands between a paper and a shipped product — that gap is our home turf.',
      ctaPrimary: 'Start a conversation',
      ctaSecondary: 'See what we do',
    },
    marquee: ['Embodied intelligence', 'Robotic systems', 'Perception & control', 'Smart manufacturing', 'Global delivery'],
    stats: [
      { value: '30', label: 'years in manufacturing & trade' },
      { value: '3', label: 'schools — Tsinghua, Yale, Cambridge' },
      { value: '1', label: 'focus — AI into the physical world' },
    ],
    research: {
      eyebrow: 'Research',
      title: 'What we work on',
      body: 'Not chasing benchmarks. The brief is simple: AI that can perceive, act, and hold up in the physical world.',
      items: [
        {
          n: '01',
          title: 'Embodied intelligence',
          text: 'Perception, decision-making, execution. Agents that figure real tasks out on their own — not in pristine demo environments, but on floors with dust, drift and interference.',
        },
        {
          n: '02',
          title: 'Robotic systems',
          text: 'Sensing, control, safety and mechanics wired into one whole. A module that tops a leaderboard is a start; a system that runs for years is the point.',
        },
        {
          n: '03',
          title: 'Prototype to product',
          text: 'Running in the lab and working in the plant are separated by materials, assembly, cost and yield. We have walked that road for 30 years.',
        },
      ],
    },
    team: {
      eyebrow: 'Team',
      title: 'Two native languages: papers, and the factory floor.',
      groups: [
        {
          n: 'A',
          title: 'The research side',
          text: 'Tsinghua, Yale, Cambridge — taste for hard problems, trained in labs.',
        },
        {
          n: 'B',
          title: 'The operations side',
          text: '30 years of factory production and import-export — judgment trained beside production lines and shipping containers.',
        },
      ],
      quote: 'Papers tell us what’s possible. The floor tells us what’s practical.',
    },
    manufacturing: {
      eyebrow: 'Manufacturing & Trade',
      title: 'Technology ships only if it can be built.',
      body: 'A handsome prototype is easy. Production is not: yield, cost, supply chain, deadlines — then customs, and a shelf on the other side of the world. We know these steps the honest way: order by order.',
      items: [
        {
          n: '01',
          title: 'Factory instinct',
          text: 'Reliability, materials and assembly problems get spotted early — because we have fixed them before.',
        },
        {
          n: '02',
          title: 'Global trade',
          text: 'Export paperwork, international clients, delivery chains — all familiar roads.',
        },
        {
          n: '03',
          title: 'Tech translation',
          text: 'Every research direction faces three questions first: Can we build it? Can customers afford it? Can we service it?',
        },
      ],
    },
    vision: {
      eyebrow: 'Vision',
      title: 'Intelligent machines shouldn’t live in demo reels.',
      body: 'We want them on factory floors and in daily life — reliable, durable, and improving with every generation.',
    },
    contact: {
      eyebrow: 'Contact',
      title: 'Partnerships, media, investment — write to us.',
    },
    footer: 'AI & robotics research, built to ship.',
  },
}

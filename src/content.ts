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

export interface BizItem {
  title: string
  text: string
}

export interface BizTrack {
  tag: string
  title: string
  body: string
  items: BizItem[]
}

export interface Dictionary {
  meta: { title: string; description: string }
  nav: { business: string; team: string; manufacturing: string; contact: string }
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
  business: { eyebrow: string; title: string; body: string; b: BizTrack; c: BizTrack }
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
      title: '迅洲科技 AccelJoy Tech | 工厂自动化 × 消费智能硬件',
      description:
        '迅洲科技 AccelJoy Tech 做两条业务线：面向工厂的自动化——机器人、AI 监控等大多数产线需求；面向消费者的智能硬件与软件服务。团队来自清华、耶鲁、剑桥，30 年制造与进出口经验。',
    },
    nav: {
      business: '业务',
      team: '团队',
      manufacturing: '制造与贸易',
      contact: '联系',
    },
    hero: {
      eyebrow: '工厂自动化 · 消费智能硬件',
      titleA: '迅洲科技',
      titleB: 'ACCELJOY TECH',
      lead: '让工厂更自动，让生活更智能。',
      body: '迅洲科技做两条业务线：To B，给工厂做自动化——机器人、AI 监控，以及产线自动化的大多数需求；To C，把技术做成消费级智能硬件和软件服务。团队来自清华、耶鲁、剑桥，家里做了 30 年工厂生产与进出口生意——我们知道怎么把技术做成产品，再把产品卖出去。',
      ctaPrimary: '聊聊合作',
      ctaSecondary: '看看我们做什么',
    },
    marquee: ['工业机器人', 'AI 监控', '自动化系统集成', '消费智能硬件', '软件服务', '更多场景，欢迎来聊'],
    stats: [
      { value: '30', label: '年 · 制造与进出口经验' },
      { value: '3', label: '所 · 清华、耶鲁、剑桥' },
      { value: '2', label: '条业务线 · To B 自动化 × To C 硬件' },
    ],
    business: {
      eyebrow: '业务',
      title: '我们做什么',
      body: '两条线，一个底层能力：让自动化和 AI 在真实场景里稳定干活。下面列的是常见场景——你的需求不在这里？大概率也能做，欢迎先聊。',
      b: {
        tag: 'To B',
        title: '工厂自动化',
        body: '给工厂装上自动化与 AI：机器人干活，系统盯质量、安全与设备。',
        items: [
          {
            title: '机器人与自动化',
            text: '工业机器人、自动化产线与系统集成。',
          },
          {
            title: 'AI 推理监控',
            text: '质检、安全、设备状态等场景的监控与检测系统。',
          },
          {
            title: '其他产线需求',
            text: '工厂的需求五花八门，大多数我们都能做——说说你的场景。',
          },
        ],
      },
      c: {
        tag: 'To C',
        title: '智能硬件与服务',
        body: '把同一套技术做小、做好用，放进日常生活。',
        items: [
          {
            title: '消费级智能硬件',
            text: '面向家庭与个人用户的智能硬件产品。',
          },
          {
            title: '软件与服务',
            text: '配套的软件产品与持续的服务。',
          },
        ],
      },
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
      body: '样机好看不难，难的是量产。无论是发往工厂的自动化设备，还是送到用户手里的硬件，走的都是同一条路：良率、成本、供应链、交期——然后过海关，到地球另一边的货架上。这些环节我们熟，不是调研来的，是一单一单做出来的。',
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
      title: '让工厂更自动，让生活更智能——并且是真的可靠、真的好用。',
      body: '我们站在同一套能力的两条延长线上：一边把自动化送进车间，一边把智能硬件送进日常。30 年制造与贸易的家底，让这两条路都走得通。',
    },
    contact: {
      eyebrow: '联系',
      title: '合作、采购、渠道、投资——欢迎来信。',
    },
    footer: '工厂自动化 × 消费智能硬件，为落地而生。',
  },
  en: {
    meta: {
      title: 'AccelJoy Tech | Factory Automation × Consumer Hardware',
      description:
        'AccelJoy Tech runs two product lines: factory automation — robots, AI monitoring and most production-line needs; and consumer smart hardware with software services. Team from Tsinghua, Yale and Cambridge, with 30 years of manufacturing and trade.',
    },
    nav: {
      business: 'Business',
      team: 'Team',
      manufacturing: 'Manufacturing',
      contact: 'Contact',
    },
    hero: {
      eyebrow: 'Factory Automation · Consumer Hardware',
      titleA: 'AccelJoy Tech',
      titleB: '迅洲科技',
      lead: 'Smarter factories. Smarter daily life.',
      body: 'AccelJoy Tech runs two product lines. To B: factory automation — robots, AI monitoring, and most automation needs on the production line. To C: the same technology shaped into consumer smart hardware and software services. Our team came out of Tsinghua, Yale and Cambridge, with 30 years of manufacturing and trade behind us — we know how to turn technology into products, and products into shipments.',
      ctaPrimary: 'Start a conversation',
      ctaSecondary: 'See what we build',
    },
    marquee: [
      'Industrial robots',
      'AI monitoring',
      'System integration',
      'Consumer hardware',
      'Software services',
      'More — just ask',
    ],
    stats: [
      { value: '30', label: 'years in manufacturing & trade' },
      { value: '3', label: 'schools — Tsinghua, Yale, Cambridge' },
      { value: '2', label: 'product lines — To B automation × To C hardware' },
    ],
    business: {
      eyebrow: 'Business',
      title: 'What we do',
      body: 'Two lines, one core ability: automation and AI that hold up in real environments. What follows is the common ground — if your need isn’t listed, we can probably still do it. Talk to us first.',
      b: {
        tag: 'To B',
        title: 'Factory automation',
        body: 'Automation and AI for the plant: robots do the work while systems watch quality, safety and equipment.',
        items: [
          {
            title: 'Robots & automation',
            text: 'Industrial robots, automated lines and system integration.',
          },
          {
            title: 'AI inference monitoring',
            text: 'Monitoring and inspection for quality, safety and equipment conditions.',
          },
          {
            title: 'Other line needs',
            text: 'Factory requirements come in all shapes — we can take on most of them. Tell us yours.',
          },
        ],
      },
      c: {
        tag: 'To C',
        title: 'Smart hardware & services',
        body: 'The same technology, made smaller and friendlier, into daily life.',
        items: [
          {
            title: 'Consumer smart hardware',
            text: 'Smart hardware products for homes and individual users.',
          },
          {
            title: 'Software & services',
            text: 'Companion software and ongoing services.',
          },
        ],
      },
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
      body: 'A handsome prototype is easy. Production is not. Whether it is automation equipment headed for a plant or hardware headed for a user’s hands, the road is the same: yield, cost, supply chain, deadlines — then customs, and a shelf on the other side of the world. We know these steps the honest way: order by order.',
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
          text: 'Every direction faces three questions first: Can we build it? Can customers afford it? Can we service it?',
        },
      ],
    },
    vision: {
      eyebrow: 'Vision',
      title: 'Smarter factories, smarter daily life — actually reliable, actually usable.',
      body: 'We work on two extensions of the same ability: carrying automation into the workshop, and smart hardware into everyday life. Thirty years of manufacturing and trade make both roads walkable.',
    },
    contact: {
      eyebrow: 'Contact',
      title: 'Partnerships, procurement, distribution, investment — write to us.',
    },
    footer: 'Factory automation × consumer hardware, built to ship.',
  },
}

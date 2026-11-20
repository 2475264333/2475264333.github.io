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
  solar: {
    hint: string
    go: string
    items: { key: string; planet: string; name: string; section: string; desc: string }[]
  }
  footer: string
}

export const translations: Record<Lang, Dictionary> = {
  zh: {
    meta: {
      title: '迅洲科技 AccelJoy Tech | 工厂自动化 × 消费智能硬件',
      description:
        '迅洲科技 AccelJoy Tech 以具身智能与机器人系统为核心，为全球工厂提供自动化与 AI 监控解决方案，并将同一技术延伸至消费级智能硬件与软件服务。团队汇聚清华、耶鲁、剑桥英才与三十年制造及进出口积淀。',
    },
    nav: {
      business: '业务版图',
      team: '创始团队',
      manufacturing: '制造与贸易',
      contact: '联系我们',
    },
    hero: {
      eyebrow: '具身智能 · 机器人系统 · 智能制造',
      titleA: '迅洲科技',
      titleB: 'ACCELJOY TECH',
      lead: '以智能重塑产业，以匠心连接世界。',
      body: '迅洲科技立足人工智能与机器人技术的交汇处，业务纵贯产业两端——向内，我们为全球工厂构筑自动化与智能监控的坚实底座，让产线拥有感知与思考的能力；向外，我们将前沿技术凝练为触手可及的消费级智能硬件与软件服务。团队汇聚清华、耶鲁、剑桥的科研纵深，承袭三十年制造与全球贸易的产业积淀——我们深知，一项技术从实验室走向世界，需要跨越多少关山，而我们，正是为此而生。',
      ctaPrimary: '开启合作',
      ctaSecondary: '探索业务版图',
    },
    stats: [
      { value: '30', label: '载 · 制造与全球贸易积淀' },
      { value: '3', label: '所 · 清华、耶鲁、剑桥英才汇聚' },
      { value: '2', label: '线 · 产业自动化 × 消费智能硬件' },
    ],
    business: {
      eyebrow: '业务版图',
      title: '双线并进，智造未来',
      body: '两条业务线，同源一处核心能力：让自动化与人工智能在真实世界中经久运转、值得托付。所列皆为深耕场景——您的需求不在此列？以我们的纵深，大概率可以抵达。期待与您率先展开对话。',
      b: {
        tag: 'To B',
        title: '工厂自动化',
        body: '为现代工厂注入感官与智慧：机器人精密作业，智能系统洞察质量、守护安全、预见设备脉动。',
        items: [
          {
            title: '机器人与自动化系统',
            text: '工业机器人、自动化产线规划与系统集成，从方案设计到落地交付的全链路服务。',
          },
          {
            title: 'AI 推理监控',
            text: '以视觉推理赋能质检、安全与设备监测，让每一次检测都精准如一、经年如一。',
          },
          {
            title: '更多产线可能',
            text: '工厂的需求千姿百态，而我们的技术纵深足以覆盖大多数场景——不妨谈谈您的设想。',
          },
        ],
      },
      c: {
        tag: 'To C',
        title: '智能硬件与服务',
        body: '将同一技术淬炼至精简与优雅，融入千家万户的日常。',
        items: [
          {
            title: '消费级智能硬件',
            text: '面向家庭与个人用户的智能硬件产品，让前沿科技成为生活的底色。',
          },
          {
            title: '软件与持续服务',
            text: '与之配套的软件生态与长期服务——产品交付只是起点，体验进化永不止步。',
          },
        ],
      },
    },
    team: {
      eyebrow: '创始团队',
      title: '一语论文，一语车间，双语并行。',
      groups: [
        {
          n: 'A',
          title: '研究之翼',
          text: '清华、耶鲁、剑桥——对复杂问题的品味与敬畏，在顶尖实验室的日日夜夜里淬炼而成。',
        },
        {
          n: 'B',
          title: '产业之根',
          text: '三十载工厂生产与进出口——对可靠性、成本与交付的判断力，在产线与货柜之侧千锤百炼。',
        },
      ],
      quote: '论文昭示何为可能，车间笃定何为可行——而我们将两者熔于一炉。',
    },
    manufacturing: {
      eyebrow: '制造与全球贸易',
      title: '技术唯有经由制造，方能抵达世界。',
      body: '样机的精致从来不难，难的是量产的千锤百炼：良率、成本、供应链、交期——继而跨越海关，最终抵达地球另一端的货架。无论是发往工厂的自动化设备，还是交付用户之手的智能硬件，皆循此道。这些环节我们了然于胸——并非来自调研报告，而是三十年间，一单一单、亲手铸就。',
      items: [
        {
          n: '01',
          title: '工厂直觉',
          text: '可靠性、材料、装配的暗礁，我们总能提前望见——因为曾经亲历，所以预见。',
        },
        {
          n: '02',
          title: '全球贸易',
          text: '进出口流程、国际客户、跨境交付链路，皆是行走了三十年的熟路。',
        },
        {
          n: '03',
          title: '技术转化',
          text: '每一项技术皆须闯过三重叩问：能否制造？用户能否承受？问世之后能否经年服务？',
        },
      ],
    },
    vision: {
      eyebrow: '愿景',
      title: '让智能机器走出实验室，成为这个时代可信赖的生产力。',
      body: '我们立于人工智能、机器人工程、制造智慧与全球协作的十字路口——一手将自动化送入车间深处，一手将智能硬件送进日常生活的肌理。三十载制造与贸易的家底，让这两条道路皆可抵达远方。',
    },
    contact: {
      eyebrow: '联系我们',
      title: '合作、采购、渠道、投资——期待与您共启下一程。',
    },
    solar: {
      hint: '悬停探索 · 点击启程',
      go: '进入',
      items: [
        { key: 'business', planet: '火星 Mars', name: '业务版图', section: '#business', desc: '赤红行星，文明的活动疆界——工厂自动化 × 消费智能硬件，双线并进' },
        { key: 'team', planet: '地球 Earth', name: '创始团队', section: '#team', desc: '已知唯一的生命之舟——清华、耶鲁、剑桥的深度，与 30 年产业的厚度' },
        { key: 'manufacturing', planet: '木星 Jupiter', name: '制造与贸易', section: '#manufacturing', desc: '行星之王，质量超越其余总和——30 年工厂生产与全球贸易的深厚引力' },
        { key: 'vision', planet: '土星 Saturn', name: '愿景', section: '#vision', desc: '戴冠的远行者，恒久运行——让智能机器成为可靠、可持续进化的生产力' },
        { key: 'contact', planet: '水星 Mercury', name: '联系我们', section: '#contact', desc: '距太阳最近的信使——一次联络，即刻启程' },
      ],
    },
    footer: '工厂自动化 × 消费智能硬件——为落地而生，为世界而来。',
  },
  en: {
    meta: {
      title: 'AccelJoy Tech | Factory Automation × Consumer Hardware',
      description:
        'AccelJoy Tech builds embodied intelligence and robotic systems: factory automation and AI monitoring for plants worldwide, and the same technology refined into consumer smart hardware and software services. A team drawn from Tsinghua, Yale and Cambridge, on thirty years of manufacturing and trade.',
    },
    nav: {
      business: 'Business',
      team: 'Team',
      manufacturing: 'Manufacturing',
      contact: 'Contact',
    },
    hero: {
      eyebrow: 'Embodied Intelligence · Robotics · Smart Manufacturing',
      titleA: 'AccelJoy Tech',
      titleB: '迅洲科技',
      lead: 'Reshaping industry with intelligence. Connecting the world with craft.',
      body: 'AccelJoy Tech stands at the crossroads of artificial intelligence and robotics, with operations spanning both ends of the industry. Inward, we build the automation and intelligent-monitoring backbone for factories worldwide — giving production lines the power to perceive and to reason. Outward, we distill the same frontier technology into consumer smart hardware and software services. Our team carries the research depth of Tsinghua, Yale and Cambridge, and the industrial heritage of thirty years in manufacturing and global trade. We know precisely what it takes for a technology to travel from laboratory to world — that journey is why we exist.',
      ctaPrimary: 'Start a conversation',
      ctaSecondary: 'Explore our business',
    },
    stats: [
      { value: '30', label: 'years of manufacturing & global trade' },
      { value: '3', label: 'institutions — Tsinghua, Yale, Cambridge' },
      { value: '2', label: 'lines — industrial automation × consumer hardware' },
    ],
    business: {
      eyebrow: 'Business',
      title: 'Two lines, one future',
      body: 'Two product lines, one core capability: automation and AI that endure in the real world and earn trust over time. What follows is our home ground — yet if your need lies beyond this list, chances are we can still reach it. We look forward to the conversation.',
      b: {
        tag: 'To B',
        title: 'Factory automation',
        body: 'Senses and intelligence for the modern plant: robots working with precision while intelligent systems watch quality, guard safety, and read the pulse of equipment.',
        items: [
          {
            title: 'Robots & automation systems',
            text: 'Industrial robots, production-line planning and system integration — full-cycle service from design to delivery.',
          },
          {
            title: 'AI inference monitoring',
            text: 'Visual reasoning for inspection, safety and equipment monitoring — every check precise, every day, for years.',
          },
          {
            title: 'Beyond the list',
            text: 'Factory needs come in countless shapes, and our technical depth covers most of them — tell us what you envision.',
          },
        ],
      },
      c: {
        tag: 'To C',
        title: 'Smart hardware & services',
        body: 'The same technology, refined into something simpler and more graceful, woven into everyday life.',
        items: [
          {
            title: 'Consumer smart hardware',
            text: 'Smart hardware for homes and individuals — frontier technology as part of daily life.',
          },
          {
            title: 'Software & services',
            text: 'A companion software ecosystem with long-term service — delivery is only the beginning; the experience keeps evolving.',
          },
        ],
      },
    },
    team: {
      eyebrow: 'Team',
      title: 'Two native languages: the paper, and the floor.',
      groups: [
        {
          n: 'A',
          title: 'The research wing',
          text: 'Tsinghua, Yale, Cambridge — a taste for hard problems, forged in the long nights of world-class laboratories.',
        },
        {
          n: 'B',
          title: 'The industrial root',
          text: 'Thirty years of factory production and import-export — judgment on reliability, cost and delivery, tempered beside production lines and shipping containers.',
        },
      ],
      quote: 'Papers reveal what is possible; the floor confirms what is practical — we forge the two into one.',
    },
    manufacturing: {
      eyebrow: 'Manufacturing & Global Trade',
      title: 'Technology reaches the world only through manufacturing.',
      body: 'An elegant prototype is easy; production is the crucible — yield, cost, supply chain, deadlines — then customs, and finally a shelf on the far side of the world. Automation equipment bound for a plant and hardware bound for a user’s hands travel the same road. We know every step — not from reports, but from thirty years of building it, order by order.',
      items: [
        {
          n: '01',
          title: 'Factory instinct',
          text: 'The hidden reefs of reliability, materials and assembly — we see them early, because we have sailed these waters.',
        },
        {
          n: '02',
          title: 'Global trade',
          text: 'Export procedures, international clients, cross-border delivery chains — roads we have walked for thirty years.',
        },
        {
          n: '03',
          title: 'Tech translation',
          text: 'Every technology must answer three questions: Can it be built? Can customers bear it? Can it be serviced for years to come?',
        },
      ],
    },
    vision: {
      eyebrow: 'Vision',
      title: 'Intelligent machines, out of the laboratory — into the world as trusted productivity.',
      body: 'We stand at the crossroads of AI research, robotics engineering, manufacturing wisdom and global collaboration — carrying automation deep into the workshop, and smart hardware into the fabric of daily life. Thirty years of manufacturing and trade make both roads lead far.',
    },
    contact: {
      eyebrow: 'Contact',
      title: 'Partnerships, procurement, distribution, investment — the next chapter begins with you.',
    },
    solar: {
      hint: 'Hover to explore · Click to embark',
      go: 'Enter',
      items: [
        { key: 'business', planet: 'Mars', name: 'Business', section: '#business', desc: 'The red frontier — factory automation × consumer smart hardware, in parallel' },
        { key: 'team', planet: 'Earth', name: 'Team', section: '#team', desc: 'The only known cradle of life — the depth of Tsinghua, Yale and Cambridge, with 30 years of industry' },
        { key: 'manufacturing', planet: 'Jupiter', name: 'Manufacturing', section: '#manufacturing', desc: 'King of planets, more massive than all the rest combined — the deep gravity of 30 years in production and trade' },
        { key: 'vision', planet: 'Saturn', name: 'Vision', section: '#vision', desc: 'The crowned voyager, in eternal orbit — intelligent machines as enduring, ever-evolving productivity' },
        { key: 'contact', planet: 'Mercury', name: 'Contact', section: '#contact', desc: 'The closest messenger to the Sun — one message, and the journey begins' },
      ],
    },
    footer: 'Factory automation × consumer hardware — built to ship, built for the world.',
  },
}

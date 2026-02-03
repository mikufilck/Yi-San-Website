// src/data/designers.ts

export interface DesignerWork {
  id: number;
  title: string;
  subTitle: string;
  image: string;
}

export interface Designer {
  id: number;
  name: string;
  title: string; // 简短头衔（列表页用）
  fullTitle: string; // 详细头衔（详情页用）
  image: string;
  bio: string[]; // 分段简介
  works: DesignerWork[];
}

export const DESIGNERS: Designer[] = [
  {
    id: 1,
    name: "许斌",
    title: "中国 | 一三创始人",
    fullTitle: "设计师、一三设计品牌创始人兼首席创意总监",
    image: "/images/designer/许斌.webp",
    bio: [
      "致力于研究中国文化在建筑空间里的运用和创新，以个性化、独特的视觉语言来表达设计理念，以全新的视觉传达来解读中国文化元素。",
      "在作品中，将「当代性」、「文化性」、「艺术性」共溶、共生，以此作为设计语言用于空间表达。",
      "从传统与当下的共通、碰撞处，找寻设计的灵感；在艺术与生活的交错、和谐处，追求设计的本质。在历史的记忆碎片与当下思想的结合中，寻找设计文化的精神诉求。"
    ],
    works: [
      { 
        id: 278, 
        title: "长宁床", 
        subTitle: "CHANG NING BED", 
        image: "/Upload/goods/20240702/5583b4d063d48e8add46aa1100df5bbf.jpg" 
      },
      { 
        id: 267, 
        title: "云杉沙发", 
        subTitle: "YUN SHAN SOFA", 
        image: "/Upload/goods/20240702/03e848bed4d17a4dabcbbf3b9e7d2064.jpg" 
      },
      // 以后在这里继续添加该设计师的作品
    ]
  },
  // 以后在这里直接添加第二个设计师对象
];
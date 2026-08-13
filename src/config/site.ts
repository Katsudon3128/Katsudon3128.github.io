export const siteConfig = {
  name: "查理林｜資深 Web 軟體工程師",
  url: "https://katsudon3128.github.io/",
  owner: "查理林",
  description: "能將 Web 軟體產品從概念帶到上線及基本維運的資深工程師。",
  navigation: [
    { href: "/", label: "首頁" },
    { href: "/about/", label: "關於我" },
    { href: "/projects/", label: "專案" },
    { href: "/blog/", label: "部落格" },
  ],
  contact: {
    email: "hello@example.com",
    github: "https://github.com/Katsudon3128",
    linkedin: "https://www.linkedin.com/in/example/",
  },
  home: {
    headline: "把 Web 軟體產品，從概念做到上線。",
    introduction:
      "我是查理林，一名完整承擔需求、設計、開發、部署與基本維運的資深工程師。",
  },
  pages: {
    home: {
      title: "首頁",
      description: "查理林的能力、展示專案、文章與最新想法。",
    },
    about: {
      title: "關於我",
      description:
        "認識查理林的背景、工作經歷、從 0 到 1 能力、常用技術、工作原則與聯絡管道。",
    },
    projects: {
      title: "專案",
      description: "查理林自行開發的 Web 軟體展示專案。",
    },
    blog: {
      title: "部落格",
      description: "關於 Web 軟體產品設計、開發與維運的文章。",
    },
    notFound: {
      title: "找不到頁面",
      description: "指定的頁面不存在。",
    },
  },
  assets: {
    logo: "/assets/site-logo.svg",
    favicon: "/assets/favicon.svg",
    portraits: {
      about: {
        src: "/assets/avatar-about.svg",
        alt: "查理林的透明背景虛擬人像插畫",
        width: 720,
        height: 900,
      },
    },
    covers: {
      home: {
        src: "/assets/cover-home.svg",
        alt: "深色背景上交錯排列的產品設計與程式碼區塊",
        position: "50% 50%",
        overlay: 0.7,
      },
      about: {
        src: "/assets/cover-about.svg",
        alt: "深色背景上的產品工作流程與連結節點",
        position: "50% 45%",
        overlay: 0.72,
      },
      projects: {
        src: "/assets/cover-projects.svg",
        alt: "深色背景上的多個產品介面視窗",
        position: "50% 50%",
        overlay: 0.7,
      },
      blog: {
        src: "/assets/cover-blog.svg",
        alt: "深色背景上的文章段落與程式碼片段",
        position: "50% 50%",
        overlay: 0.72,
      },
    },
  },
} as const;

export type PageMetadata = {
  title: string;
  description: string;
};

export type CoverConfig =
  (typeof siteConfig.assets.covers)[keyof typeof siteConfig.assets.covers];

export type PortraitConfig =
  (typeof siteConfig.assets.portraits)[keyof typeof siteConfig.assets.portraits];

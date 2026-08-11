export const projectStatuses = ["開發中", "維護中", "已封存"] as const;

export type ProjectStatus = (typeof projectStatuses)[number];

export type Project = {
  name: string;
  summary: string;
  image: string;
  imageAlt: string;
  technologies: string[];
  status: ProjectStatus;
  githubUrl: string;
  featured: boolean;
};

export const projects: Project[] = [
  {
    name: "內容營運工作台",
    summary: "把內容規劃、審核與發布狀態整合在同一條可追蹤流程。",
    image: "/assets/project-content.svg",
    imageAlt: "內容營運工作台的欄位與狀態介面示意圖",
    technologies: ["Astro", "TypeScript", "PostgreSQL"],
    status: "開發中",
    githubUrl: "https://github.com/Katsudon3128",
    featured: true,
  },
  {
    name: "服務健康儀表板",
    summary: "集中呈現服務狀態、部署事件與需要採取行動的異常。",
    image: "/assets/project-health.svg",
    imageAlt: "服務健康儀表板的狀態圖表介面示意圖",
    technologies: ["TypeScript", "Node.js", "OpenTelemetry"],
    status: "維護中",
    githubUrl: "https://github.com/Katsudon3128",
    featured: true,
  },
  {
    name: "需求決策紀錄器",
    summary: "保留產品需求的背景、取捨與實作結果，讓決策能被追溯。",
    image: "/assets/project-decisions.svg",
    imageAlt: "需求決策紀錄器的決策時間軸介面示意圖",
    technologies: ["Astro", "SQLite", "Playwright"],
    status: "已封存",
    githubUrl: "https://github.com/Katsudon3128",
    featured: true,
  },
  {
    name: "部署檢查清單",
    summary: "以小型工具整理靜態網站部署前的必要驗證。",
    image: "/assets/project-release.svg",
    imageAlt: "部署檢查清單的完成狀態介面示意圖",
    technologies: ["TypeScript", "GitHub Actions"],
    status: "維護中",
    githubUrl: "https://github.com/Katsudon3128",
    featured: false,
  },
];

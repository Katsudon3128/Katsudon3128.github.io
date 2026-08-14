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
    name: "Namemo 名字備忘錄",
    summary: "用簡潔的 Web 介面記錄名字與辨識提示，降低再次見面時的記憶負擔。",
    image: "/assets/project-content.svg",
    imageAlt: "Namemo 名字備忘錄的欄位介面示意圖",
    technologies: ["TypeScript", "CSS", "HTML"],
    status: "開發中",
    githubUrl: "https://github.com/Katsudon3128/namemo",
    featured: true,
  },
  {
    name: "PTT Watcher 2",
    summary:
      "以 Python 追蹤 PTT 內容，將需要持續查看的資訊整理成可處理的流程。",
    image: "/assets/project-health.svg",
    imageAlt: "PTT Watcher 2 的追蹤狀態介面示意圖",
    technologies: ["Python"],
    status: "維護中",
    githubUrl: "https://github.com/Katsudon3128/ptt-watcher2",
    featured: true,
  },
  {
    name: "Fuwari 部落格模板",
    summary: "以 Astro 建構的靜態部落格模板，兼顧內容維護與輕量瀏覽體驗。",
    image: "/assets/project-decisions.svg",
    imageAlt: "Fuwari 部落格模板的文章列表介面示意圖",
    technologies: ["Astro", "TypeScript", "Svelte"],
    status: "維護中",
    githubUrl: "https://github.com/Katsudon3128/fuwari",
    featured: true,
  },
  {
    name: "PTT Watcher",
    summary: "整合瀏覽器與 Python 工具，自動整理 PTT 上需要持續關注的內容。",
    image: "/assets/project-release.svg",
    imageAlt: "PTT Watcher 的內容追蹤介面示意圖",
    technologies: ["JavaScript", "HTML", "Python"],
    status: "已封存",
    githubUrl: "https://github.com/Katsudon3128/ptt-watcher",
    featured: false,
  },
];

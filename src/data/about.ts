export interface YearMonth {
  datetime?: string;
  label: string;
}

export interface WorkExperience {
  organization: string;
  role: string;
  start: YearMonth;
  end: YearMonth;
  responsibilities: readonly string[];
  outcomes: readonly string[];
}

const workExperiences: readonly WorkExperience[] = [
  {
    organization: "產品團隊（可替換示例）",
    role: "資深 Web 軟體工程師",
    start: { datetime: "2022-01", label: "2022.01" },
    end: { label: "至今" },
    responsibilities: [
      "釐清產品目標與交付範圍，將需求拆成可驗證的迭代。",
      "負責前後端設計、實作、測試、部署與基本維運。",
    ],
    outcomes: [
      "建立可重複建置與部署的交付流程，降低每次上線的人工步驟。",
      "用公開輸出與可觀察行為驗證產品，讓後續修改保有信心。",
    ],
  },
];

export const aboutContent = {
  careerLength: "4 年以上（可替換示例）",
  background: [
    "我是在台北工作的 Web 軟體工程師，習慣先理解產品要解決的問題，再決定技術與交付方式。",
    "我偏好承擔一段完整結果：從模糊需求、產品與技術設計，到前後端實作、部署上線及上線後的基本維運。",
  ],
  experiences: workExperiences,
  capabilities: [
    { stage: "需求", description: "釐清目標、限制、使用情境與可驗證成果" },
    { stage: "設計", description: "建立產品流程、內容模型與技術邊界" },
    { stage: "實作", description: "完成前後端、測試與必要的服務整合" },
    { stage: "上線", description: "建立自動化檢查、部署與回復路徑" },
    { stage: "維運", description: "觀察服務健康、處理問題並持續小步改善" },
  ],
  technologies: [
    "TypeScript",
    "JavaScript",
    "Node.js",
    "Astro",
    "HTML",
    "CSS",
    "SQL",
    "GitHub Actions",
  ],
  principles: [
    {
      title: "先對齊成果",
      description: "先說清楚誰會使用、問題是什麼，以及完成後如何驗證。",
    },
    {
      title: "讓決策可追溯",
      description: "把重要限制與取捨留在團隊能維護的文件與程式碼裡。",
    },
    {
      title: "以公開行為測試",
      description: "從使用者可觀察的邊界驗證產品，避免測試綁死內部實作。",
    },
    {
      title: "保持交付可逆",
      description: "小步上線、保留回復路徑，讓改善不必以服務穩定性為代價。",
    },
  ],
} as const;

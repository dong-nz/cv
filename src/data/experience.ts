import type { ExperienceEntry } from "@/types";

export const experiences: ExperienceEntry[] = [
  {
    id: "open-to-work",
    variant: "current",
    title: "Đang tìm nơi làm việc mới",
    titleEn: "Seeking a New Place",
    company: "Open to new opportunities",
    duration: "Nov 2026 – Present",
    responsibilities: [
      "Sẵn sàng cho vai trò Senior Engineering: system architecture, integration platform, full-stack delivery",
    ],
    responsibilitiesEn: [
      "Open to Senior Engineering roles: system architecture, integration platforms, full-stack delivery",
      "Available from Nov 2026",
    ],
  },
  {
    id: "relax-gap",
    variant: "gap",
    title: "Nghỉ ngơi",
    titleEn: "Relax",
    company: "Career break",
    duration: "Aug 2026 – Oct 2026",
    responsibilities: [
      "Nghỉ có chủ đích giữa hai vai trò — lấy lại nhịp trước khi nhận hệ thống tiếp theo",
      "Tự thử nghiệm theo nhịp riêng: local LLM với llama.cpp, đọc về Computer Vision",
    ],
    responsibilitiesEn: [
      "Intentional break between roles — recovering the rhythm before the next system",
    ],
  },
  {
    id: "lazada-senior-swe",
    title: "Senior Software Engineer",
    titleEn: "Senior Software Engineer",
    company: "Lazada Tech Hub Vietnam",
    duration: "Jan 2020 – Aug 2026",
    location: "Ho Chi Minh City, Vietnam",
    responsibilities: [
      "System ownership và architecture design cho logistics integration systems",
      "Developed IoT-DWS integration solution deployed across 16 sortations",
      "Led system maintenance and modernization for production environments",
      "Applied Computer Vision and ML to solve real-world operational problems",
      "Scrum Master responsibilities — team achieved Scrum Level L3",
    ],
    responsibilitiesEn: [
      "System ownership and architecture design for logistics integration systems",
      "Developed IoT-DWS integration solution deployed across 16 sortations",
      "Led system maintenance and modernization for production environments",
      "Applied Computer Vision and ML to solve real-world operational problems",
      "Scrum Master responsibilities — team achieved Scrum Level L3",
    ],
  },
  {
    id: "nexts-founder",
    title: "Người sáng lập",
    titleEn: "CTO & Founder",
    company: "Nexts Limited Company",
    duration: "06/2019 – 12/2019",
    location: "Ho Chi Minh City, Vietnam",
    responsibilities: [
      "Phát triển giải pháp cho xe tự hành, thu thập dữ liệu thời gian thực từ cảm biến và hệ thống onboard: LiDAR, camera, GPS, CAN bus.",
    ],
    responsibilitiesEn: [
      "Developed a solution for autonomous vehicles to collect real-time data from onboard sensors and systems, including LiDAR, cameras, GPS, and CAN bus.",
    ],
  },
  {
    id: "sap-senior-swe",
    title: "Senior Software Engineer",
    titleEn: "Senior Software Engineer",
    company: "SAP Lab Vietnam",
    duration: "2017 – 12/2019",
    location: "Ho Chi Minh City, Vietnam",
    responsibilities: [
      "Team leader quản lý sản phẩm B1 Integration",
    ],
    responsibilitiesEn: [
      "Team leader managing the B1 Integration product",
    ],
  }
];

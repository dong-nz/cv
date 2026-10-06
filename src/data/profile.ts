import type { Profile } from "@/types";

export const profile: Profile = {
  name: "Your Name",
  title: "Senior Software Engineer",
  tagline:
    "Building scalable software systems,\nintelligent logistics solutions,\nand practical AI applications.",
  bio: "Senior Software Engineer với kinh nghiệm xây dựng hệ thống phân tán, logistics technology, và ứng dụng AI/ML vào bài toán thực tế. Tập trung vào system architecture, integration, và production-grade solutions.",
  email: "your.email@example.com",
  githubUrl: "https://github.com/yourusername",
  linkedinUrl: "https://linkedin.com/in/yourusername",
  currentInterests: [
    "AI in logistics",
    "Digital twins",
    "Simulation",
    "LLM",
    "Computer Vision",
    "High-performance systems",
  ],
  philosophy: [
    {
      title: "Build for the real problem",
      description:
        "Không bắt đầu bằng technology. Bắt đầu bằng problem.",
      keywords: ["Problem-first", "Business value", "Measurement"],
    },
    {
      title: "Think in systems",
      description:
        "Quan tâm đến kiến trúc tổng thể, không chỉ từng component.",
      keywords: ["Architecture", "Integration", "Scalability", "Reliability"],
    },
    {
      title: "Measure impact",
      description:
        "Technical implementation phải gắn với measurable outcome.",
      keywords: ["Performance", "Reliability", "Cost", "Efficiency"],
    },
    {
      title: "Keep learning",
      description:
        "Continuous exploration of new technologies and approaches.",
      keywords: ["AI/ML", "Computer Vision", "LLM", "Distributed systems"],
    },
  ],
};

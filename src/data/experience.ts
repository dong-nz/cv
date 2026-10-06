import type { ExperienceEntry } from "@/types";

export const experiences: ExperienceEntry[] = [
  {
    id: "senior-swe",
    title: "Senior Software Engineer",
    company: "Current Company",
    duration: "2021 – Present",
    location: "Ho Chi Minh City, Vietnam",
    responsibilities: [
      "System ownership và architecture design cho logistics integration systems",
      "Developed IoT-DWS integration solution deployed across 16 sortations",
      "Led system maintenance and modernization for production environments",
      "Applied Computer Vision and ML to solve real-world operational problems",
      "Scrum Master responsibilities — team achieved Scrum Level L3",
    ],
    achievements: [
      {
        id: "iot-dws",
        title: "IoT-DWS Integration System",
        context:
          "Tiếp nhận và nhanh chóng làm chủ hệ thống IoT-DWS sau khi thành viên phụ trách trước đó rời project.",
        technicalWork: [
          "HTTP integration with Signature Header",
          "HMAC-based request/response security",
          "RocketMQ integration",
          "HTTP engine development",
          "Integration with DWS machines",
        ],
        impact: "Giải pháp DWS integration được triển khai cho 16 sortations",
        metrics: ["16 sortations deployed"],
        technologies: ["Java", "HTTP", "HMAC", "RocketMQ", "DWS"],
        featured: true,
      },
      {
        id: "awb-detection",
        title: "AWB Detection / Computer Vision",
        context:
          "Tự động phát hiện shipping label / AWB từ hình ảnh được camera trên sortation machine chụp.",
        technicalWork: [
          "OpenCV image preprocessing",
          "YOLO-based object detection",
          "Oriented Bounding Box (OBB)",
          "ONNX model inference",
          "OCR pipeline",
        ],
        impact:
          "Model được fine-tune cho bài toán AWB detection, xử lý white label trên white package",
        metrics: ["70,000 images/month processed"],
        technologies: ["Python", "OpenCV", "YOLO", "ONNX", "OCR"],
        featured: true,
      },
      {
        id: "system-maintenance",
        title: "System Maintenance & Optimization",
        context:
          "Duy trì và hiện đại hóa hệ thống production theo yêu cầu của security/infrastructure team.",
        technicalWork: [
          "Migration to newer middleware versions",
          "OSS cleanup and duplicate image removal",
          "System maintenance automation",
        ],
        impact: "Giảm OSS storage khoảng 7 GB/month",
        metrics: ["7 GB/month reduction", "70,000 images/month"],
        technologies: ["Docker", "Linux", "OSS", "CI/CD"],
        featured: true,
      },
    ],
  },
];

import type { ProjectDetail } from "@/types";

export const projects: ProjectDetail[] = [
  {
    id: "iot-dws-integration",
    title: "IoT-DWS Integration System",
    summary:
      "Thiết kế và triển khai hệ thống integration giữa IoT devices và DWS (Dimensioning Weighing Scanning) machines cho 16 sortations.",
    category: "logistics",
    role: "Senior Software Engineer — System Owner",
    technologies: ["Java", "HTTP", "HMAC", "RocketMQ", "DWS"],
    metrics: ["16 sortations deployed"],
    featured: true,
    githubUrl: "https://github.com/yourusername",
    sections: [
      {
        id: "context",
        number: 1,
        title: "Context",
        content:
          "Tiếp nhận và nhanh chóng làm chủ một hệ thống IoT-DWS sau khi thành viên phụ trách trước đó rời project. Cần hiểu nhanh architecture hiện tại và tiếp tục phát triển integration solution.",
        type: "text",
      },
      {
        id: "problem",
        number: 2,
        title: "Problem",
        content:
          "Cần integration giữa các IoT devices (sensors, cameras) và DWS machines — hệ thống vật lý phức tạp với nhiều protocol khác nhau (HMI, FTP, HTTP).",
        type: "text",
      },
      {
        id: "solution",
        number: 4,
        title: "Solution",
        content:
          "Thiết kế HTTP-based integration engine với HMAC security, RocketMQ messaging, và protocol adapters cho HMI/FTP/HTTP.",
        type: "text",
      },
      {
        id: "architecture",
        number: 5,
        title: "Architecture",
        content:
          "```text\nIoT Devices\n    ↓\nProtocol Adapters (HMI/FTP/HTTP)\n    ↓\nHTTP Engine + HMAC Security\n    ↓\nRocketMQ\n    ↓\nDWS Machines\n```",
        type: "diagram",
      },
      {
        id: "challenges",
        number: 7,
        title: "Challenges",
        content:
          "Nhiều protocol khác nhau, security requirements (HMAC signature), real-time data processing, production reliability.",
        type: "text",
      },
      {
        id: "result",
        number: 8,
        title: "Result",
        content:
          "Giải pháp được triển khai cho 16 sortations, ổn định trong production, hỗ trợ 3 protocols (HMI, FTP, HTTP).",
        type: "text",
      },
    ],
  },
  {
    id: "awb-detection",
    title: "AWB Detection / Computer Vision",
    summary:
      "Ứng dụng Computer Vision và Machine Learning để tự động phát hiện và OCR shipping label từ hình ảnh camera trên sortation.",
    category: "computer-vision",
    role: "Senior Software Engineer — ML Engineering",
    technologies: ["Python", "OpenCV", "YOLO", "ONNX", "OCR"],
    metrics: ["70,000 images/month processed"],
    featured: true,
    sections: [
      {
        id: "context",
        number: 1,
        title: "Context",
        content:
          "Sortation machines chụp ảnh packages khi di chuyển trên băng chuyền. Cần tự động đọc AWB (Air Waybill) từ ảnh để tracking và sorting.",
        type: "text",
      },
      {
        id: "problem",
        number: 2,
        title: "Problem",
        content:
          "White label trên white package — traditional CV methods không đủ robust. Cần ML-based detection.",
        type: "text",
      },
      {
        id: "pipeline",
        number: 4,
        title: "Pipeline",
        content:
          "```text\nImage\n  ↓\nAWB/Label Detection (YOLO)\n  ↓\nBounding Box / OBB\n  ↓\nRotation Correction\n  ↓\nCrop\n  ↓\nOCR\n  ↓\nText Extraction\n```",
        type: "diagram",
      },
      {
        id: "challenges",
        number: 7,
        title: "Challenges",
        content:
          "White label on white package, rotated labels, varying lighting conditions, real-time inference requirements.",
        type: "text",
      },
      {
        id: "result",
        number: 8,
        title: "Result",
        content:
          "Model fine-tuned cho AWB detection, xử lý 70,000 images/month. Presentation tại Tech Talk workshop.",
        type: "text",
      },
    ],
  },
  {
    id: "facility-management",
    title: "Facility Management Platform",
    summary:
      "Xây dựng nền tảng digital twin cho logistics facilities — mô hình hóa facility, theo dõi real-time, và recommendation system.",
    category: "software-engineering",
    role: "Senior Software Engineer — Platform Design",
    technologies: ["Go", "TypeScript", "Docker", "Event-driven"],
    featured: true,
    sections: [
      {
        id: "vision",
        number: 1,
        title: "Vision",
        content:
          "Chuyển đổi từ manual operations sang Operation Intelligence Platform — thu thập data, monitor, analyze, recommend, decide.",
        type: "text",
      },
      {
        id: "architecture",
        number: 5,
        title: "Architecture",
        content:
          "```text\nPhysical Facility\n    ↓\nData Collection\n    ↓\nFacility Model\n    ↓\nDigital Twin\n    ↓\nSimulation\n    ↓\nAnalytics\n    ↓\nRecommendation\n    ↓\nOperation Decision\n```",
        type: "diagram",
      },
      {
        id: "result",
        number: 8,
        title: "Result",
        content:
          "Platform hỗ trợ facility modeling, real-time visibility, và recommendation cho capacity planning.",
        type: "text",
      },
    ],
  },
  {
    id: "local-llm-experiments",
    title: "Local LLM Experiments",
    summary:
      "Technical exploration về running local MoE LLMs với llama.cpp — GPU offloading, VRAM optimization, performance tracing.",
    category: "experiment",
    role: "Engineering Experiment",
    technologies: ["llama.cpp", "Qwen", "MoE", "Python", "CUDA"],
    featured: true,
    sections: [
      {
        id: "exploration",
        number: 1,
        title: "Exploration",
        content:
          "Technical exploration về MoE (Mixture of Experts), expert routing, GPU offloading, VRAM optimization, prefill/decode pipeline.",
        type: "text",
      },
      {
        id: "learnings",
        number: 9,
        title: "Lessons Learned",
        content:
          "Understand the system → Measure → Analyze → Optimize. Không phải khoe hardware — mà thể hiện engineering approach.",
        type: "text",
      },
    ],
  },
];

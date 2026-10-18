import type { ProjectDetail } from "@/types";

export const projects: ProjectDetail[] = [
  {
    id: "iot-dws-integration",
    title: "Tích hợp hệ thống IoT-DWS",
    titleEn: "IoT-DWS Integration System",
    summary:
      "Thiết kế và triển khai hệ thống integration giữa IoT devices và DWS (Dimensioning Weighing Scanning) machines cho 16 sortations.",
    summaryEn:
      "Designed and deployed an integration system between IoT devices and DWS (Dimensioning Weighing Scanning) machines across 16 sortations.",
    category: "logistics",
    role: "Senior Software Engineer — System Owner",
    technologies: ["Java", "HTTP", "HMAC", "RocketMQ", "DWS"],
    metrics: ["16 sortations deployed"],
    featured: true,
    sections: [
      {
        id: "context",
        title: "Context",
        titleEn: "Context",
        content:
          "Tiếp nhận và nhanh chóng làm chủ một hệ thống IoT-DWS sau khi thành viên phụ trách trước đó rời project. Cần hiểu nhanh architecture hiện tại và tiếp tục phát triển integration solution.",
        contentEn:
          "Took over and rapidly mastered an IoT-DWS system after the previous responsible team member left the project. Needed to quickly understand the current architecture and continue developing the integration solution.",
        type: "text",
      },
      {
        id: "problem",
        title: "Problem",
        titleEn: "Problem",
        content:
          "Cần integration giữa các IoT devices (sensors, cameras) và DWS machines — hệ thống vật lý phức tạp với nhiều protocol khác nhau (HMI, FTP, HTTP).",
        contentEn:
          "Needed integration between IoT devices (sensors, cameras) and DWS machines — a complex physical system with multiple different protocols (HMI, FTP, HTTP).",
        type: "text",
      },
      {
        id: "solution",
        title: "Solution",
        titleEn: "Solution",
        content:
          "Thiết kế HTTP-based integration engine với HMAC security, RocketMQ messaging, và protocol adapters cho HMI/FTP/HTTP.",
        contentEn:
          "Designed an HTTP-based integration engine with HMAC security, RocketMQ messaging, and protocol adapters for HMI/FTP/HTTP.",
        type: "text",
      },
      {
        id: "architecture",
        title: "Architecture",
        titleEn: "Architecture",
        content:
          "```text\nIoT Devices\n    ↓\nProtocol Adapters (HMI/FTP/HTTP)\n    ↓\nHTTP Engine + HMAC Security\n    ↓\nRocketMQ\n    ↓\nDWS Machines\n```",
        contentEn:
          "```text\nIoT Devices\n    ↓\nProtocol Adapters (HMI/FTP/HTTP)\n    ↓\nHTTP Engine + HMAC Security\n    ↓\nRocketMQ\n    ↓\nDWS Machines\n```",
        type: "diagram",
      },
      {
        id: "challenges",
        title: "Challenges",
        titleEn: "Challenges",
        content:
          "Nhiều protocol khác nhau, security requirements (HMAC signature), real-time data processing, production reliability.",
        contentEn:
          "Multiple different protocols, security requirements (HMAC signature), real-time data processing, production reliability.",
        type: "text",
      },
      {
        id: "result",
        title: "Result",
        titleEn: "Result",
        content:
          "Giải pháp được triển khai cho 16 sortations, ổn định trong production, hỗ trợ 3 protocols (HMI, FTP, HTTP).",
        contentEn:
          "Solution deployed across 16 sortations, stable in production, supporting 3 protocols (HMI, FTP, HTTP).",
        type: "text",
      },
    ],
  },
  {
    id: "awb-detection",
    title: "AWB Detection / Computer Vision",
    titleEn: "AWB Detection / Computer Vision",
    summary:
      "Ứng dụng Computer Vision và Machine Learning để tự động phát hiện và OCR shipping label từ hình ảnh camera trên sortation.",
    summaryEn:
      "Applied Computer Vision and Machine Learning to automatically detect and OCR shipping labels from camera images on sortation lines.",
    category: "computer-vision",
    role: "Senior Software Engineer — ML Engineering",
    technologies: ["Python", "OpenCV", "YOLO", "ONNX", "OCR"],
    metrics: ["70,000 images/month processed"],
    featured: true,
    sections: [
      {
        id: "context",
        title: "Context",
        titleEn: "Context",
        content:
          "Sortation machines chụp ảnh packages khi di chuyển trên băng chuyền. Cần tự động đọc AWB (Air Waybill) từ ảnh để tracking và sorting.",
        contentEn:
          "Sortation machines capture images of packages as they move on conveyor belts. Need to automatically read AWB (Air Waybill) from images for tracking and sorting.",
        type: "text",
      },
      {
        id: "problem",
        title: "Problem",
        titleEn: "Problem",
        content:
          "White label trên white package — traditional CV methods không đủ robust. Cần ML-based detection.",
        contentEn:
          "White label on white package — traditional CV methods are not robust enough. Needed ML-based detection.",
        type: "text",
      },
      {
        id: "pipeline",
        title: "Pipeline",
        titleEn: "Pipeline",
        content:
          "```text\nImage\n  ↓\nAWB/Label Detection (YOLO)\n  ↓\nBounding Box / OBB\n  ↓\nRotation Correction\n  ↓\nCrop\n  ↓\nOCR\n  ↓\nText Extraction\n```",
        contentEn:
          "```text\nImage\n  ↓\nAWB/Label Detection (YOLO)\n  ↓\nBounding Box / OBB\n  ↓\nRotation Correction\n  ↓\nCrop\n  ↓\nOCR\n  ↓\nText Extraction\n```",
        type: "diagram",
      },
      {
        id: "challenges",
        title: "Challenges",
        titleEn: "Challenges",
        content:
          "White label on white package, rotated labels, varying lighting conditions, real-time inference requirements.",
        contentEn:
          "White label on white package, rotated labels, varying lighting conditions, real-time inference requirements.",
        type: "text",
      },
      {
        id: "result",
        title: "Result",
        titleEn: "Result",
        content:
          "Model fine-tuned cho AWB detection, xử lý 70,000 images/month. Presentation tại Tech Talk workshop.",
        contentEn:
          "Model fine-tuned for AWB detection, processing 70,000 images/month. Presented at Tech Talk workshop.",
        type: "text",
      },
    ],
  },
  {
    id: "facility-management",
    title: "Facility Management Platform",
    titleEn: "Facility Management Platform",
    summary:
      "Xây dựng nền tảng digital twin cho logistics facilities — mô hình hóa facility, theo dõi real-time, và recommendation system.",
    summaryEn:
      "Built a digital twin platform for logistics facilities — facility modeling, real-time monitoring, and recommendation system.",
    category: "software-engineering",
    role: "Senior Software Engineer — Platform Design",
    technologies: ["Go", "TypeScript", "Docker", "Event-driven"],
    featured: true,
    sections: [
      {
        id: "vision",
        title: "Vision",
        titleEn: "Vision",
        content:
          "Chuyển đổi từ manual operations sang Operation Intelligence Platform — thu thập data, monitor, analyze, recommend, decide.",
        contentEn:
          "Transition from manual operations to an Operation Intelligence Platform — collect data, monitor, analyze, recommend, decide.",
        type: "text",
      },
      {
        id: "architecture",
        title: "Architecture",
        titleEn: "Architecture",
        content:
          "```text\nPhysical Facility\n    ↓\nData Collection\n    ↓\nFacility Model\n    ↓\nDigital Twin\n    ↓\nSimulation\n    ↓\nAnalytics\n    ↓\nRecommendation\n    ↓\nOperation Decision\n```",
        contentEn:
          "```text\nPhysical Facility\n    ↓\nData Collection\n    ↓\nFacility Model\n    ↓\nDigital Twin\n    ↓\nSimulation\n    ↓\nAnalytics\n    ↓\nRecommendation\n    ↓\nOperation Decision\n```",
        type: "diagram",
      },
      {
        id: "result",
        title: "Result",
        titleEn: "Result",
        content:
          "Platform hỗ trợ facility modeling, real-time visibility, và recommendation cho capacity planning.",
        contentEn:
          "Platform supports facility modeling, real-time visibility, and recommendations for capacity planning.",
        type: "text",
      },
    ],
  },
  {
    id: "local-llm-experiments",
    title: "Local LLM Experiments",
    titleEn: "Local LLM Experiments",
    summary:
      "Technical exploration về running local MoE LLMs với llama.cpp — GPU offloading, VRAM optimization, performance tracing.",
    summaryEn:
      "Technical exploration of running local MoE LLMs with llama.cpp — GPU offloading, VRAM optimization, performance tracing.",
    category: "experiment",
    role: "Engineering Experiment",
    technologies: ["llama.cpp", "Qwen", "MoE", "Python", "CUDA"],
    featured: true,
    sections: [
      {
        id: "exploration",
        title: "Exploration",
        titleEn: "Exploration",
        content:
          "Technical exploration về MoE (Mixture of Experts), expert routing, GPU offloading, VRAM optimization, prefill/decode pipeline.",
        contentEn:
          "Technical exploration of MoE (Mixture of Experts), expert routing, GPU offloading, VRAM optimization, prefill/decode pipeline.",
        type: "text",
      },
      {
        id: "learnings",
        title: "Lessons Learned",
        titleEn: "Lessons Learned",
        content:
          "Understand the system → Measure → Analyze → Optimize. Không phải khoe hardware — mà thể hiện engineering approach.",
        contentEn:
          "Understand the system → Measure → Analyze → Optimize. Not about showing off hardware — but demonstrating engineering approach.",
        type: "text",
      },
    ],
  },
];

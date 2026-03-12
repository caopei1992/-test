import { GoogleGenAI, Type } from "@google/genai";

// Helper to get a fresh AI instance
const getAi = () => {
  // Use process.env.API_KEY if available (from user selection), otherwise fallback to GEMINI_API_KEY
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  return new GoogleGenAI({ apiKey: apiKey });
};

export interface TenderAnalysisResult {
  coreIndicators: {
    investmentScale: string;
    deliveryCycle: string;
    technicalStandards: string;
    qualityRequirements: string;
    procurementScope: string;
    constructionContent: string;
  };
  tenderRequirements: Array<{
    item: string;
    description: string;
    quantity: string;
    unit: string;
  }>;
  bidderQualifications: Array<{
    category: string;
    requirement: string;
    source?: { name: string; tier: string; url?: string };
  }>;
  technicalParameters: Array<{
    parameter: string;
    value: string;
    tolerance: string;
    type: "Functional" | "Performance" | "Safety" | "General";
    source?: { name: string; tier: string; url?: string };
  }>;
  riskAssessment: Array<{
    risk: string;
    mitigation: string;
  }>;
  marketAnalysis: string;
  marketStats: {
    competitiveness: "High" | "Medium" | "Low";
    estimatedSupplierCount: number;
    qualificationRate: string;
  };
  scoringCriteria: Array<{
    criterion: string;
    weight: string;
    description: string;
    category: "Technical" | "Business" | "Price";
    source?: { name: string; tier: string; url?: string };
  }>;
  projectTimeline: Array<{
    phase: string;
    duration: string;
    deliverable: string;
  }>;
  policyCheck: Array<{
    rule: string;
    status: "Pass" | "Warning" | "Fail";
    comment: string;
  }>;
  historicalComparison: string;
  productAdvice: {
    recommendedSpecs: string;
    optionsAnalysis: string;
    bestChoice: string;
  };
  referenceProjects: Array<{
    projectName: string;
    similarity: string;
    winningBidAmount: string;
    successFactors: string;
    keyTakeaway: string;
  }>;
}

export interface StrategyResult {
  projectOverview: string;
  procurementStrategy: string;
  keyFocusAreas: string[];
  potentialRisks: string[];
  suggestedTimeline: string;
}

export async function formulateStrategy(
  projectDescription: string
): Promise<StrategyResult> {
  const ai = getAi();
  const model = "gemini-3.1-pro-preview";

  const prompt = `
    You are a Senior Procurement Strategy Consultant. 
    Based on the following project requirements, formulate a high-level procurement strategy.
    
    Project Description:
    "${projectDescription}"

    Please provide the response in **Chinese (Simplified)**.

    Return the result strictly as a valid JSON object with the following structure:
    {
      "projectOverview": "...",
      "procurementStrategy": "...",
      "keyFocusAreas": ["...", "..."],
      "potentialRisks": ["...", "..."],
      "suggestedTimeline": "..."
    }
    
    Do not include markdown code blocks. Just return the raw JSON string.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    let text = response.text;
    if (!text) throw new Error("No response from Gemini");

    text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    return JSON.parse(text) as StrategyResult;
  } catch (error: any) {
    console.error("Error formulating strategy:", error);
    if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("QUOTA_EXHAUSTED");
    }
    throw error;
  }
}

export interface ParsedRequirement {
  investmentScale: string;
  projectCycle: string;
  constructionContent: string[];
  technicalRequirements: string[];
  qualityStandards: string[];
}

export interface AnalysisSummary {
  techCaseCount: number;
  qualificationCaseCount: number;
  avgIndustryCycle: string;
  referenceCases: Array<{
    id: string;
    name: string;
    description: string;
    selected: boolean;
  }>;
}

export async function parseRequirements(
  input: string
): Promise<ParsedRequirement> {
  const ai = getAi();
  const model = "gemini-3.1-pro-preview";

  const prompt = `
    你是一位资深的招标代理专家。请解析以下项目需求，提取关键信息。
    
    项目描述与需求:
    "${input}"

    请提取以下内容并以 JSON 格式返回：
    1. 投资规模 (investmentScale)
    2. 项目周期 (projectCycle)
    3. 核心建设内容 (constructionContent) - 字符串数组
    4. 技术需求 (technicalRequirements) - 字符串数组
    5. 质量标准 (qualityStandards) - 字符串数组

    返回格式示例:
    {
      "investmentScale": "480万元",
      "projectCycle": "6个月",
      "constructionContent": ["数据管理平台", "数据分析模块"],
      "technicalRequirements": ["支持1000并发", "等保三级"],
      "qualityStandards": ["符合国家软件质量标准"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });
    return JSON.parse(response.text) as ParsedRequirement;
  } catch (error: any) {
    console.error("Error parsing requirements:", error);
    if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("QUOTA_EXHAUSTED");
    }
    throw error;
  }
}

export async function generateAnalysisSummary(
  parsedData: ParsedRequirement
): Promise<AnalysisSummary> {
  const ai = getAi();
  const model = "gemini-3.1-pro-preview";

  const prompt = `
    基于以下已解析的项目需求，进行多维数据分析（模拟分析历史案例、行业标杆、市场信息）。
    
    项目需求:
    ${JSON.stringify(parsedData)}

    请生成推荐方案摘要并以 JSON 格式返回：
    1. 技术方案参考案例数量 (techCaseCount) - 数字
    2. 推荐资格条件参考案例数量 (qualificationCaseCount) - 数字
    3. 行业平均项目周期 (avgIndustryCycle) - 字符串
    4. 参考案例列表 (referenceCases) - 包含 id, name, description 的对象数组

    返回格式示例:
    {
      "techCaseCount": 12,
      "qualificationCaseCount": 8,
      "avgIndustryCycle": "6-8个月",
      "referenceCases": [
        { "id": "A", "name": "参考案例A", "description": "某智慧城市数据平台建设项目" },
        { "id": "B", "name": "参考案例B", "description": "大型国企数字化转型项目" }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });
    const result = JSON.parse(response.text);
    return {
      ...result,
      referenceCases: result.referenceCases.map((c: any) => ({ ...c, selected: false }))
    } as AnalysisSummary;
  } catch (error: any) {
    console.error("Error generating analysis summary:", error);
    if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("QUOTA_EXHAUSTED");
    }
    throw error;
  }
}

export async function analyzeTenderRequirements(
  projectDescription: string
): Promise<TenderAnalysisResult> {
  const ai = getAi();
  const model = "gemini-3.1-pro-preview";

  const prompt = `
    You are a Senior Procurement Strategy Consultant with over 20 years of experience in large-scale public sector and enterprise tendering.
    Your task is to conduct a deep, professional analysis of the following project procurement requirement document and generate a comprehensive, strategic tender plan.

    Project Description:
    "${projectDescription}"

    Your analysis must be rigorous, data-driven, and compliant with relevant regulations (e.g., 《中华人民共和国招标投标法》, 《中华人民共和国政府采购法》).
    Use formal, professional terminology suitable for high-level management review.

    Please perform the following analysis and return the result in **Chinese (Simplified)**, structured into the following 5 core sections:

    1.  **Procurement Requirement Description (采购需求说明)**:
        -   **Core Indicators**: Investment Scale, Delivery Cycle, Technical Standards, Quality Requirements.
        -   **Scope & Content**: Define the Procurement Scope (采购范围) and Construction Content (建设内容).
        -   Provide a strategic overview of the project's objectives and key success factors.

    2.  **Technical Specifications & Parameters (技术规范与技术参数)**:
        -   Define Functional Requirements, Technical Indicators, Performance Requirements, Safety & Quality Standards with high precision.
        -   Classify each parameter as "Functional", "Performance", "Safety", or "General".
        -   **Data Source**: For each parameter, provide a \`source\` object indicating where this standard comes from. The source must include a \`name\`, a \`tier\` ("Tier 1 (Authority)", "Tier 2 (Market Reference)", or "Tier 3 (Internal Knowledge)"), and an optional \`url\`.

    3.  **Bidder Qualifications (投标人资格条件)**:
        -   Define Enterprise Qualifications, Performance Requirements, Personnel Requirements, Reputation Requirements, ensuring they are fair, competitive, and compliant.
        -   **Data Source**: For each qualification, provide a \`source\` object indicating where this requirement comes from. The source must include a \`name\`, a \`tier\` ("Tier 1 (Authority)", "Tier 2 (Market Reference)", or "Tier 3 (Internal Knowledge)"), and an optional \`url\`.

    4.  **Evaluation Methods & Scoring Criteria (评标办法与评分标准)**:
        -   Suggest a sophisticated scoring breakdown for Technical (技术), Business (商务), and Price (价格) aspects, ensuring the criteria effectively distinguish high-quality bidders.
        -   **Data Source**: For each criterion, provide a \`source\` object indicating where this scoring rule comes from. The source must include a \`name\`, a \`tier\` ("Tier 1 (Authority)", "Tier 2 (Market Reference)", or "Tier 3 (Internal Knowledge)"), and an optional \`url\`.

    5.  **Tender Planning Scheme (招标策划方案)**:
        -   Integrate a comprehensive Risk Assessment, Market Analysis, Project Timeline, Policy Check, Historical Comparison, Product Advice, and Reference Projects.
        -   For Reference Projects, include relevant, similar bidding projects for reference, including key project details, winning bid amounts, and success factors, to support data-driven decision-making.
        -   Provide strategic advice on the procurement model (e.g., open tender, competitive negotiation).

    Return the result strictly as a valid JSON object with the following structure:
    {
      "coreIndicators": {
        "investmentScale": "...",
        "deliveryCycle": "...",
        "technicalStandards": "...",
        "qualityRequirements": "...",
        "procurementScope": "...",
        "constructionContent": "..."
      },
      "tenderRequirements": [
        { "item": "...", "description": "...", "quantity": "...", "unit": "..." }
      ],
      "bidderQualifications": [
        { "category": "Mandatory" | "Optional", "requirement": "...", "source": { "name": "...", "tier": "Tier 1 (Authority)", "url": "..." } }
      ],
      "technicalParameters": [
        { "parameter": "...", "value": "...", "tolerance": "...", "type": "Functional" | "Performance" | "Safety" | "General", "source": { "name": "...", "tier": "Tier 2 (Market Reference)", "url": "..." } }
      ],
      "riskAssessment": [
        { "risk": "...", "mitigation": "..." }
      ],
      "marketAnalysis": "...",
      "marketStats": {
        "competitiveness": "High" | "Medium" | "Low",
        "estimatedSupplierCount": 10,
        "qualificationRate": "60%"
      },
      "scoringCriteria": [
        { "criterion": "...", "weight": "...", "description": "...", "category": "Technical" | "Business" | "Price", "source": { "name": "...", "tier": "Tier 3 (Internal Knowledge)", "url": "..." } }
      ],
      "projectTimeline": [
        { "phase": "...", "duration": "...", "deliverable": "..." }
      ],
      "policyCheck": [
        { "rule": "...", "status": "Pass" | "Warning" | "Fail", "comment": "..." }
      ],
      "historicalComparison": "...",
      "productAdvice": {
        "recommendedSpecs": "...",
        "optionsAnalysis": "...",
        "bestChoice": "..."
      },
      "referenceProjects": [
        { "projectName": "...", "similarity": "...", "winningBidAmount": "...", "successFactors": "...", "keyTakeaway": "..." }
      ]
    }
    
    Do not include markdown code blocks (like \`\`\`json). Just return the raw JSON string.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            coreIndicators: {
              type: Type.OBJECT,
              properties: {
                investmentScale: { type: Type.STRING },
                deliveryCycle: { type: Type.STRING },
                technicalStandards: { type: Type.STRING },
                qualityRequirements: { type: Type.STRING },
                procurementScope: { type: Type.STRING },
                constructionContent: { type: Type.STRING },
              },
            },
            tenderRequirements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  item: { type: Type.STRING },
                  description: { type: Type.STRING },
                  quantity: { type: Type.STRING },
                  unit: { type: Type.STRING },
                },
              },
            },
            bidderQualifications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  requirement: { type: Type.STRING },
                  source: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      tier: { type: Type.STRING },
                      url: { type: Type.STRING },
                    },
                  },
                },
              },
            },
            technicalParameters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  parameter: { type: Type.STRING },
                  value: { type: Type.STRING },
                  tolerance: { type: Type.STRING },
                  type: { type: Type.STRING },
                  source: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      tier: { type: Type.STRING },
                      url: { type: Type.STRING },
                    },
                  },
                },
              },
            },
            riskAssessment: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  risk: { type: Type.STRING },
                  mitigation: { type: Type.STRING },
                },
              },
            },
            marketAnalysis: { type: Type.STRING },
            marketStats: {
              type: Type.OBJECT,
              properties: {
                competitiveness: { type: Type.STRING },
                estimatedSupplierCount: { type: Type.NUMBER },
                qualificationRate: { type: Type.STRING },
              },
            },
            scoringCriteria: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  criterion: { type: Type.STRING },
                  weight: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: { type: Type.STRING },
                  source: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      tier: { type: Type.STRING },
                      url: { type: Type.STRING },
                    },
                  },
                },
              },
            },
            projectTimeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phase: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  deliverable: { type: Type.STRING },
                },
              },
            },
            policyCheck: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  rule: { type: Type.STRING },
                  status: { type: Type.STRING },
                  comment: { type: Type.STRING },
                },
              },
            },
            historicalComparison: { type: Type.STRING },
            productAdvice: {
              type: Type.OBJECT,
              properties: {
                recommendedSpecs: { type: Type.STRING },
                optionsAnalysis: { type: Type.STRING },
                bestChoice: { type: Type.STRING },
              },
            },
            referenceProjects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  projectName: { type: Type.STRING },
                  similarity: { type: Type.STRING },
                  winningBidAmount: { type: Type.STRING },
                  successFactors: { type: Type.STRING },
                  keyTakeaway: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    let text = response.text;
    if (!text) throw new Error("No response from Gemini");

    // Cleanup markdown code blocks if present
    text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");

    return JSON.parse(text) as TenderAnalysisResult;
  } catch (error: any) {
    console.error("Error analyzing tender:", error);
    if (error.message?.includes("429") || error.message?.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("QUOTA_EXHAUSTED");
    }
    throw error;
  }
}

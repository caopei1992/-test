import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Check, 
  ChevronRight, 
  FileText, 
  Upload, 
  BrainCircuit, 
  FileCheck, 
  ArrowLeft,
  Save,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Plus,
  Download,
  FolderOpen,
  Link as LinkIcon,
  Pencil,
  Trash2,
  Home,
  Clock,
  Key,
  Building2,
  Calendar,
  FileUp,
  X,
  Type,
  Banknote,
  Tag,
  AlignLeft,
  ListChecks,
  Paperclip,
  Gavel,
  BarChart3
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  analyzeTenderRequirements, 
  parseRequirements,
  generateAnalysisSummary,
  type TenderAnalysisResult, 
  type ParsedRequirement,
  type AnalysisSummary 
} from '@/services/gemini';
import { toast } from 'sonner';

// --- Types ---
type ProjectData = {
  name: string;
  budget: string;
  type: string;
  industry: string;
  deliveryCycle: string;
  background: string;
  requirements: string;
  files: string[];
  feasibilityReport?: string;
  techPlan?: string;
  historicalDocs?: string;
  supplements: string;
};

  // --- Components ---

  const EditableText = ({ value, onChange, className, multiline = false }: { value: string, onChange: (v: string) => void, className?: string, multiline?: boolean }) => {
    const [isEditing, setIsEditing] = useState(false);
    
    if (isEditing) {
      return multiline ? (
        <textarea
          autoFocus
          value={value}
          onBlur={() => setIsEditing(false)}
          onChange={(e) => onChange(e.target.value)}
          className={cn("w-full p-2 border border-indigo-500 rounded-md outline-none text-sm", className)}
          rows={4}
        />
      ) : (
        <input
          autoFocus
          type="text"
          value={value}
          onBlur={() => setIsEditing(false)}
          onChange={(e) => onChange(e.target.value)}
          className={cn("w-full p-2 border border-indigo-500 rounded-md outline-none text-sm", className)}
        />
      );
    }
    
    return (
      <div 
        onClick={() => setIsEditing(true)}
        className={cn("cursor-pointer hover:bg-blue-50 p-1 rounded transition-colors", className)}
      >
        {value || <span className="text-slate-400 italic">点击编辑...</span>}
      </div>
    );
  };

  const Stepper = ({ currentStep, steps }: { currentStep: number, steps: string[] }) => {
    return (
      <div className="flex items-center justify-between w-full px-4 py-6 bg-white border-b border-slate-100">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                index <= currentStep ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
              )}>
                {index < currentStep ? <Check size={16} /> : index + 1}
              </div>
              <span className={cn(
                "text-xs font-medium",
                index <= currentStep ? "text-blue-600" : "text-slate-400"
              )}>{step}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "h-0.5 flex-1 mx-4",
                index < currentStep ? "bg-blue-600" : "bg-slate-100"
              )} />
            )}
          </div>
        ))}
      </div>
    );
  };

  export const ProjectWorkflow = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode'); // 'upload' or 'manual'
  
    const [currentStep, setCurrentStep] = useState(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [parsedRequirement, setParsedRequirement] = useState<ParsedRequirement | null>(null);
    const [analysisSummary, setAnalysisSummary] = useState<AnalysisSummary | null>(null);
    const [analysisResult, setAnalysisResult] = useState<TenderAnalysisResult | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showDraftsModal, setShowDraftsModal] = useState(false);
    const [drafts, setDrafts] = useState<any[]>([]);
    const [isManual, setIsManual] = useState(mode === 'manual');
    
    useEffect(() => {
      setIsManual(mode === 'manual');
    }, [mode]);
    
    useEffect(() => {
      const savedDrafts = JSON.parse(localStorage.getItem('tender_drafts') || '[]');
      setDrafts(savedDrafts);
    }, [showDraftsModal]);

    const [projectData, setProjectData] = useState<ProjectData>(() => {
      return {
        name: '',
        budget: '',
        type: 'service',
        industry: '',
        deliveryCycle: '',
        background: '',
        requirements: '',
        files: [],
        supplements: ''
      };
    });

    const saveDraft = () => {
      const savedDrafts = JSON.parse(localStorage.getItem('tender_drafts') || '[]');
      const newDraft = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString(),
        name: projectData.name || '未命名草稿',
        data: projectData
      };
      savedDrafts.unshift(newDraft);
      localStorage.setItem('tender_drafts', JSON.stringify(savedDrafts));
      setDrafts(savedDrafts);
      toast.success("草稿已保存");
    };

    const loadDraft = (draftData: any) => {
      setProjectData(draftData);
      setShowDraftsModal(false);
      toast.success("已加载草稿");
    };

    const deleteDraft = (id: string) => {
      const updatedDrafts = drafts.filter(d => d.id !== id);
      localStorage.setItem('tender_drafts', JSON.stringify(updatedDrafts));
      setDrafts(updatedDrafts);
      toast.success("草稿已删除");
    };

    const clearDraft = () => {
      localStorage.removeItem('tender_drafts');
    };

    const updateRequirement = (index: number, field: keyof TenderAnalysisResult['tenderRequirements'][0], value: string) => {
      if (!analysisResult) return;
      const newReqs = [...analysisResult.tenderRequirements];
      newReqs[index] = { ...newReqs[index], [field]: value };
      setAnalysisResult({ ...analysisResult, tenderRequirements: newReqs });
    };

    const updateTechnicalParam = (index: number, field: keyof TenderAnalysisResult['technicalParameters'][0], value: string) => {
      if (!analysisResult) return;
      const newParams = [...analysisResult.technicalParameters];
      newParams[index] = { ...newParams[index], [field]: value };
      setAnalysisResult({ ...analysisResult, technicalParameters: newParams });
    };

    const updateQualification = (index: number, field: keyof TenderAnalysisResult['bidderQualifications'][0], value: string) => {
      if (!analysisResult) return;
      const newQuals = [...analysisResult.bidderQualifications];
      newQuals[index] = { ...newQuals[index], [field]: value };
      setAnalysisResult({ ...analysisResult, bidderQualifications: newQuals });
    };

    const updateScoring = (index: number, field: keyof TenderAnalysisResult['scoringCriteria'][0], value: string) => {
      if (!analysisResult) return;
      const newScoring = [...analysisResult.scoringCriteria];
      newScoring[index] = { ...newScoring[index], [field]: value };
      setAnalysisResult({ ...analysisResult, scoringCriteria: newScoring });
    };
  
    const steps = [
      "需求录入",
      "需求解析",
      "智能分析",
      "要素生成",
      "成果导出"
    ];
  
    const handleStepAction = async () => {
      if (currentStep === 0) {
        if (!projectData.name.trim() || !projectData.requirements.trim()) {
          toast.error("请完善项目基础信息与需求");
          return;
        }
        handleParseRequirements();
      } else if (currentStep === 1) {
        handleIntelligentAnalysis();
      } else if (currentStep === 2) {
        handleGenerateElements();
      }
    };

    const handleParseRequirements = async () => {
      setIsAnalyzing(true);
      try {
        const fullInput = `
          项目名称: ${projectData.name}
          采购类型: ${projectData.type}
          预算: ${projectData.budget}
          交付周期: ${projectData.deliveryCycle}
          行业: ${projectData.industry}
          背景: ${projectData.background}
          需求: ${projectData.requirements}
          补充: ${projectData.supplements}
        `;
        const result = await parseRequirements(fullInput);
        setParsedRequirement(result);
        setCurrentStep(1);
      } catch (error: any) {
        console.error(error);
        toast.error("解析失败，请重试");
      } finally {
        setIsAnalyzing(false);
      }
    };

    const handleIntelligentAnalysis = async () => {
      if (!parsedRequirement) return;
      setIsAnalyzing(true);
      try {
        const result = await generateAnalysisSummary(parsedRequirement);
        setAnalysisSummary(result);
        setCurrentStep(2);
      } catch (error: any) {
        console.error(error);
        toast.error("分析失败，请重试");
      } finally {
        setIsAnalyzing(false);
      }
    };

    const handleGenerateElements = async () => {
      setCurrentStep(3); // Loading state
      try {
        const fullInput = JSON.stringify({
          projectData,
          parsedRequirement,
          selectedCases: analysisSummary?.referenceCases.filter(c => c.selected)
        });
        const result = await analyzeTenderRequirements(fullInput);
        setAnalysisResult(result);
        // Step 3 is review, so we stay there
      } catch (error: any) {
        console.error(error);
        toast.error("生成失败，请重试");
        setCurrentStep(2);
      }
    };

    const handleExport = () => {
      if (!analysisResult) {
        toast.error("暂无策划方案可导出");
        return;
      }
      
      const content = `
# ${projectData.name} - 招标策划方案

## 1. 项目基本信息
- 预算规模: ${projectData.budget}万元
- 采购类型: ${projectData.type === 'service' ? '服务类' : projectData.type === 'goods' ? '货物类' : '工程类'}
- 行业: ${projectData.industry}
- 交付周期: ${projectData.deliveryCycle}

## 2. 结构化需求
- 投资规模: ${parsedRequirement?.investmentScale}
- 实施周期: ${parsedRequirement?.projectCycle}
- 核心建设内容: ${parsedRequirement?.constructionContent.join('、')}

## 3. 采购需求清单
${analysisResult.tenderRequirements.map((req, i) => `${i + 1}. ${req.item}\n   描述: ${req.description}\n   数量: ${req.quantity}${req.unit}`).join('\n')}

## 4. 技术参数与规范
${analysisResult.technicalParameters.map((param, i) => `${i + 1}. ${param.parameter}\n   要求值: ${param.value}\n   类型: ${param.type}`).join('\n')}

## 5. 投标人资格条件
${analysisResult.bidderQualifications.map((qual, i) => `${i + 1}. [${qual.category === 'Mandatory' ? '强制' : '建议'}] ${qual.requirement}`).join('\n')}

## 6. 评标指标与评分规则
${analysisResult.scoringCriteria.map((score, i) => `${i + 1}. ${score.criterion} (权重: ${score.weight})\n   说明: ${score.description}`).join('\n')}
      `.trim();

      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectData.name}_招标策划方案.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("导出成功！");
    };

    const handleComplete = (target: 'workspace' | 'list' = 'workspace') => {
      const projectId = `PRJ-2026-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      const newProject = {
        id: projectId,
        name: projectData.name,
        budget: projectData.budget,
        type: projectData.type,
        industry: projectData.industry,
        deliveryCycle: projectData.deliveryCycle,
        background: projectData.background,
        requirements: projectData.requirements,
        parsedRequirement,
        analysisSummary,
        analysisResult,
        status: 'completed',
        timestamp: new Date().toISOString()
      };

      const existingProjects = JSON.parse(localStorage.getItem('projects') || '[]');
      localStorage.setItem('projects', JSON.stringify([newProject, ...existingProjects]));
      
      if (target === 'workspace') {
        toast.success("项目初始化完成，进入工作台");
        navigate(`/projects/${projectId}`);
      } else {
        toast.success("项目已保存");
        navigate(`/projects`);
      }
    };
  
    const handleBack = () => {
      if (currentStep > 0) {
        setCurrentStep(prev => prev - 1);
      }
    };
  
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string = 'files') => {
      const file = e.target.files?.[0];
      if (!file) return;
  
      setIsUploading(true);
      // Simulate extraction process
      setTimeout(() => {
        setIsUploading(false);
        setProjectData(prev => {
          const newData = { ...prev };
          if (key === 'files') {
            newData.files = [...prev.files, file.name];
          } else {
            // @ts-ignore
            newData[key] = file.name;
          }
          
          // Auto-fill some fields if it's the first file
          if (prev.files.length === 0 && !prev.name) {
            newData.name = "智慧园区安防升级改造项目";
            newData.type = "service";
            newData.budget = "480";
            newData.deliveryCycle = "6个月";
            newData.industry = "智慧城市";
            newData.background = "本项目旨在对现有园区安防系统进行全面升级，提升监控覆盖率与智能识别能力。";
            newData.requirements = "需要建设一套数据管理平台，支持数据采集、数据分析和可视化展示。包含：1. 视频监控系统升级；2. 智能门禁系统部署；3. 统一管理平台开发。";
          }
          
          return newData;
        });
        toast.success("AI 文档解析成功", {
          description: "已自动提取项目基础信息，请核对。",
          duration: 3000,
        });
      }, 1500);
    };
  
    const [hasApiKey, setHasApiKey] = useState(true);

    useEffect(() => {
      const checkKey = async () => {
        try {
          // @ts-ignore
          const has = await window.aistudio.hasSelectedApiKey();
          setHasApiKey(has);
        } catch (e) {
          console.error("Failed to check API key status", e);
        }
      };
      checkKey();
    }, []);

    const [activeTab, setActiveTab] = useState("requirements");
  
    return (
      <div className="h-screen overflow-hidden bg-slate-50/50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between z-20 relative">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/projects')} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 transition-colors">
              <ArrowLeft size={16} />
            </button>
            <button 
              onClick={() => navigate('/')} 
              className="p-1.5 hover:bg-slate-100 rounded-md text-slate-500 hover:text-blue-600 transition-colors"
              title="返回首页"
            >
              <Home size={16} />
            </button>
            <div className="h-4 w-px bg-slate-200 mx-1"></div>
            <h1 className="text-sm font-semibold text-slate-900">
              {mode === 'upload' ? '智能解析立项' : '招标策划准备流程'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {!hasApiKey && (
              <button 
                // @ts-ignore
                onClick={() => window.aistudio.openSelectKey().then(() => setHasApiKey(true))}
                className="px-3 py-1.5 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-md border border-amber-200 transition-colors flex items-center gap-1.5 animate-pulse"
                title="连接您的 Google Cloud 项目以获得更稳定的 AI 服务"
              >
                <Key size={14} /> 连接 API Key
              </button>
            )}
            <button 
              onClick={saveDraft}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 rounded-md border border-slate-200/80 transition-colors flex items-center gap-1.5"
            >
              <Save size={14} /> 保存草稿
            </button>
            <button 
              onClick={() => setShowDraftsModal(true)}
              className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50/50 rounded-md border border-blue-200/60 transition-colors flex items-center gap-1.5"
            >
              <FolderOpen size={14} /> 草稿箱 ({drafts.length})
            </button>
            <div className="text-[11px] text-slate-400 font-mono ml-2">
              ID: NEW-2026-00X
            </div>
          </div>
        </div>
  
        {/* Stepper */}
        <Stepper currentStep={currentStep} steps={steps} />
  
        {/* Drafts Modal */}
        {showDraftsModal && (
          <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FolderOpen size={18} className="text-blue-600" />
                  草稿箱
                </h3>
                <button onClick={() => setShowDraftsModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              <div className="p-2 overflow-y-auto flex-1">
                {drafts.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-sm">
                    暂无保存的草稿
                  </div>
                ) : (
                  <div className="space-y-2">
                    {drafts.map(draft => (
                      <div key={draft.id} className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center justify-between group">
                        <div>
                          <div className="font-bold text-slate-900 text-sm mb-1">{draft.name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-2">
                            <Clock size={12} /> {draft.timestamp}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => loadDraft(draft.data)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700">
                            加载
                          </button>
                          <button onClick={() => deleteDraft(draft.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-blue-50">
          <div className="max-w-3xl mx-auto w-full p-4 sm:p-6 relative">
            {isAnalyzing && (
            <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl">
              <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm font-bold text-blue-950">AI 正在深度分析中...</p>
            </div>
          )}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-md shadow-blue-500/5 border border-blue-100 p-8 min-h-[450px] flex flex-col"
          >
            {/* Step 0: Project Setup (Input) */}
            {currentStep === 0 && (
              <div className="space-y-8">
                <div className="flex items-center justify-between mb-4 pb-6 border-b border-blue-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                      <FileText size={24} className="stroke-[1.5]" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-blue-950">创建项目并提交采购需求</h2>
                      <p className="text-sm text-blue-800/70 mt-1">填写基本信息并上传相关资料</p>
                    </div>
                  </div>
                  <div className="flex items-center bg-blue-50 rounded-2xl p-1.5 border border-blue-100">
                    <button 
                      onClick={() => setIsManual(false)}
                      className={cn("px-5 py-2 text-sm font-bold rounded-xl transition-all", !isManual ? "bg-white text-blue-700 shadow-sm" : "text-blue-800/60 hover:text-blue-900")}
                    >
                      文档上传
                    </button>
                    <button 
                      onClick={() => setIsManual(true)}
                      className={cn("px-5 py-2 text-sm font-bold rounded-xl transition-all", isManual ? "bg-white text-blue-700 shadow-sm" : "text-blue-800/60 hover:text-blue-900")}
                    >
                      手动录入
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {!isManual && (
                    <div className="col-span-2">
                      <label className="flex items-center gap-2 text-sm font-bold text-blue-950 mb-4">上传资料</label>
                      <div className="grid grid-cols-2 gap-6">
                        {[
                          { label: '采购需求文档', key: 'files', required: true },
                          { label: '历史招标文件 (可选)', key: 'historicalDocs', required: false }
                        ].map((slot) => (
                          <div key={slot.key} className="space-y-3">
                            <div className="p-5 border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50/50 flex items-center justify-between hover:border-blue-400 transition-colors">
                              <span className="text-sm font-bold text-blue-900">{slot.label}</span>
                              <label className="cursor-pointer p-2 hover:bg-white rounded-xl transition-colors text-blue-600 shadow-sm border border-blue-100">
                                <FileUp size={18} />
                                <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, slot.key)} />
                              </label>
                            </div>
                            {/* Display uploaded files */}
                            {slot.key === 'files' ? (
                              projectData.files.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {projectData.files.map((f, i) => (
                                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-bold border border-blue-200">
                                      <FileText size={12} />
                                      <span className="truncate max-w-[120px]">{f}</span>
                                      <button onClick={() => setProjectData(prev => ({...prev, files: prev.files.filter((_, idx) => idx !== i)}))} className="hover:text-red-600">
                                        <X size={12} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )
                            ) : (
                              projectData.historicalDocs && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-800 rounded-full text-xs font-bold border border-blue-100 w-fit">
                                  <FileText size={12} />
                                  <span className="truncate max-w-[120px]">{projectData.historicalDocs}</span>
                                  <button onClick={() => setProjectData(prev => ({...prev, historicalDocs: undefined}))} className="hover:text-red-600">
                                    <X size={12} />
                                  </button>
                                </div>
                              )
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="col-span-2 group">
                    <label className="flex items-center gap-2 text-sm font-bold text-blue-950 mb-2"><Type size={16} className="text-blue-600" /> 项目名称 <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={projectData.name}
                      onChange={e => setProjectData({...projectData, name: e.target.value})}
                      className="w-full px-5 py-3.5 bg-white border-2 border-blue-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm group-hover:border-blue-200"
                      placeholder="例如：2026年智慧园区安防升级项目"
                    />
                  </div>
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-bold text-blue-950 mb-2"><Tag size={16} className="text-blue-600" /> 采购类型</label>
                    <select 
                      value={projectData.type}
                      onChange={e => setProjectData({...projectData, type: e.target.value})}
                      className="w-full px-5 py-3.5 bg-white border-2 border-blue-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none shadow-sm group-hover:border-blue-200"
                    >
                      <option value="service">服务</option>
                      <option value="goods">货物</option>
                      <option value="construction">工程</option>
                    </select>
                  </div>
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-bold text-blue-950 mb-2"><Banknote size={16} className="text-blue-600" /> 项目预算 (万元)</label>
                    <input 
                      type="text" 
                      value={projectData.budget}
                      onChange={e => setProjectData({...projectData, budget: e.target.value})}
                      className="w-full px-5 py-3.5 bg-white border-2 border-blue-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm group-hover:border-blue-200"
                      placeholder="可选"
                    />
                  </div>
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-bold text-blue-950 mb-2"><Calendar size={16} className="text-blue-600" /> 计划交付周期</label>
                    <input 
                      type="text" 
                      value={projectData.deliveryCycle}
                      onChange={e => setProjectData({...projectData, deliveryCycle: e.target.value})}
                      className="w-full px-5 py-3.5 bg-white border-2 border-blue-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm group-hover:border-blue-200"
                      placeholder="例如：6个月"
                    />
                  </div>
                  <div className="group">
                    <label className="flex items-center gap-2 text-sm font-bold text-blue-950 mb-2"><Building2 size={16} className="text-blue-600" /> 所属行业</label>
                    <input 
                      type="text" 
                      value={projectData.industry}
                      onChange={e => setProjectData({...projectData, industry: e.target.value})}
                      className="w-full px-5 py-3.5 bg-white border-2 border-blue-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm group-hover:border-blue-200"
                      placeholder="例如：智慧城市"
                    />
                  </div>

                  <div className="col-span-2 group">
                    <label className="flex items-center gap-2 text-sm font-bold text-blue-950 mb-2"><AlignLeft size={16} className="text-blue-600" /> 补充需求描述</label>
                    <textarea 
                      value={projectData.requirements}
                      onChange={e => setProjectData({...projectData, requirements: e.target.value})}
                      className="w-full px-5 py-3.5 bg-white border-2 border-blue-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all h-40 resize-none shadow-sm group-hover:border-blue-200"
                      placeholder="您可以用自然语言描述您的需求，例如：需要建设一套数据管理平台，支持数据采集、数据分析和可视化展示。"
                    />
                  </div>
                </div>
                
                <div className="pt-8 border-t border-blue-100 flex justify-center">
                  <button 
                    onClick={handleStepAction}
                    className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-blue-500/30 transition-all flex items-center gap-3"
                  >
                    提交需求并解析
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 1: AI Parsing (AI Understanding) */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <BrainCircuit size={20} className="stroke-[1.5]" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">AI 解析需求并生成结构化信息</h2>
                      <p className="text-xs text-slate-500 mt-0.5">请核对并确认解析出的关键信息</p>
                    </div>
                  </div>
                </div>

                {!parsedRequirement ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-sm text-slate-500">正在解析文档内容...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 block">投资规模</label>
                        <EditableText value={parsedRequirement.investmentScale} onChange={(v) => setParsedRequirement({...parsedRequirement, investmentScale: v})} className="text-sm font-bold text-slate-900" />
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 block">实施周期</label>
                        <EditableText value={parsedRequirement.projectCycle} onChange={(v) => setParsedRequirement({...parsedRequirement, projectCycle: v})} className="text-sm font-bold text-slate-900" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <section>
                        <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          核心建设内容
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                          {parsedRequirement.constructionContent.map((item, i) => (
                            <div key={i} className="flex items-center gap-2 group">
                              <div className="flex-1 p-3 bg-white border border-slate-100 rounded-lg text-sm group-hover:border-blue-200 transition-colors">
                                <EditableText value={item} onChange={(v) => {
                                  const newContent = [...parsedRequirement.constructionContent];
                                  newContent[i] = v;
                                  setParsedRequirement({...parsedRequirement, constructionContent: newContent});
                                }} />
                              </div>
                              <button 
                                onClick={() => {
                                  const newContent = parsedRequirement.constructionContent.filter((_, idx) => idx !== i);
                                  setParsedRequirement({...parsedRequirement, constructionContent: newContent});
                                }}
                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                          <button 
                            onClick={() => setParsedRequirement({...parsedRequirement, constructionContent: [...parsedRequirement.constructionContent, '新建设内容']})}
                            className="p-2 border border-dashed border-slate-200 rounded-lg text-xs text-slate-400 hover:text-blue-600 hover:border-blue-300 transition-all flex items-center justify-center gap-2"
                          >
                            <Plus size={14} /> 添加建设内容
                          </button>
                        </div>
                      </section>

                      <section>
                        <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          技术需求与质量标准
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] text-slate-400 font-bold">技术需求</label>
                            {parsedRequirement.technicalRequirements.map((item, i) => (
                              <div key={i} className="p-2 bg-white border border-slate-100 rounded-lg text-xs">
                                <EditableText value={item} onChange={(v) => {
                                  const newReqs = [...parsedRequirement.technicalRequirements];
                                  newReqs[i] = v;
                                  setParsedRequirement({...parsedRequirement, technicalRequirements: newReqs});
                                }} />
                              </div>
                            ))}
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] text-slate-400 font-bold">质量标准</label>
                            {parsedRequirement.qualityStandards.map((item, i) => (
                              <div key={i} className="p-2 bg-white border border-slate-100 rounded-lg text-xs">
                                <EditableText value={item} onChange={(v) => {
                                  const newStds = [...parsedRequirement.qualityStandards];
                                  newStds[i] = v;
                                  setParsedRequirement({...parsedRequirement, qualityStandards: newStds});
                                }} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </section>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-between">
                      <button onClick={handleBack} className="px-6 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">返回修改</button>
                      <button 
                        onClick={handleStepAction}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                      >
                        确认需求信息
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Intelligent Analysis (AI Analysis) */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Sparkles size={20} className="stroke-[1.5]" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">智能分析与方案生成</h2>
                      <p className="text-xs text-slate-500 mt-0.5">基于历史案例与行业标杆进行多维分析</p>
                    </div>
                  </div>
                </div>

                {!analysisSummary ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-sm text-slate-500">正在进行多维数据分析...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
                        <div className="text-2xl font-bold text-blue-600">{analysisSummary.techCaseCount}</div>
                        <div className="text-[10px] text-blue-400 font-bold uppercase mt-1">技术方案参考案例</div>
                      </div>
                      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                        <div className="text-2xl font-bold text-emerald-600">{analysisSummary.qualificationCaseCount}</div>
                        <div className="text-[10px] text-emerald-400 font-bold uppercase mt-1">资格条件参考案例</div>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-center">
                        <div className="text-2xl font-bold text-amber-600">{analysisSummary.avgIndustryCycle}</div>
                        <div className="text-[10px] text-amber-400 font-bold uppercase mt-1">行业平均项目周期</div>
                      </div>
                    </div>

                    <section>
                      <h3 className="text-sm font-bold text-slate-900 mb-4">推荐参考案例</h3>
                      <div className="space-y-3">
                        {analysisSummary.referenceCases.map((c) => (
                          <div 
                            key={c.id} 
                            onClick={() => {
                              const newCases = analysisSummary.referenceCases.map(item => 
                                item.id === c.id ? { ...item, selected: !item.selected } : item
                              );
                              setAnalysisSummary({...analysisSummary, referenceCases: newCases});
                            }}
                            className={cn(
                              "p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4",
                              c.selected ? "bg-blue-50 border-blue-300 shadow-sm" : "bg-white border-slate-100 hover:border-blue-200"
                            )}
                          >
                            <div className={cn(
                              "w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5",
                              c.selected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300"
                            )}>
                              {c.selected && <Check size={14} />}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900">{c.name}</div>
                              <div className="text-xs text-slate-500 mt-1">{c.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <div className="pt-6 border-t border-slate-100 flex justify-between">
                      <button onClick={handleBack} className="px-6 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">返回修改</button>
                      <button 
                        onClick={handleStepAction}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                      >
                        生成招标要素
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Generate Elements (AI Generation) */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {!analysisResult ? (
                  <div className="flex flex-col h-full">
                    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
                      <div className="relative w-24 h-24 mx-auto mb-8">
                        <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                        <div className="absolute inset-0 m-auto w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center animate-pulse">
                          <BrainCircuit className="text-blue-600" size={24} />
                        </div>
                      </div>
                      <div className="text-center space-y-4 max-w-md mx-auto">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">AI 正在生成招标核心要素</h3>
                        <div className="space-y-2">
                          {[
                            '正在生成招标需求清单...',
                            '正在编写技术参数与规范...',
                            '正在设定投标人资格条件...',
                            '正在制定评标指标与评分规则...'
                          ].map((text, i) => (
                            <div key={i} className="flex items-center justify-center gap-2 text-sm text-slate-500">
                              <div className="w-1 h-1 rounded-full bg-blue-400" />
                              {text}
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-3 font-bold uppercase tracking-widest">预计还需要 10 秒</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                          <FileCheck size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">生成招标核心要素</h2>
                      </div>
                      <div className="flex gap-2">
                        {['requirements', 'technical', 'qualifications', 'scoring'].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                              "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                              activeTab === tab ? "bg-blue-600 text-white shadow-md" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                            )}
                          >
                            {tab === 'requirements' ? '需求清单' : 
                             tab === 'technical' ? '技术参数' : 
                             tab === 'qualifications' ? '资格条件' : '评分规则'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 min-h-[400px]">
                      {activeTab === 'requirements' && (
                        <div className="space-y-4">
                          {analysisResult.tenderRequirements.map((item, i) => (
                            <div key={i} className="p-4 bg-white rounded-lg border border-slate-100 flex justify-between items-start group">
                              <div className="space-y-1 flex-1">
                                <EditableText value={item.item} onChange={(v) => updateRequirement(i, 'item', v)} className="text-sm font-bold" />
                                <EditableText multiline value={item.description} onChange={(v) => updateRequirement(i, 'description', v)} className="text-xs text-slate-500" />
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <EditableText value={item.quantity} onChange={(v) => updateRequirement(i, 'quantity', v)} className="text-xs font-bold w-12 text-center" />
                                <EditableText value={item.unit} onChange={(v) => updateRequirement(i, 'unit', v)} className="text-xs text-slate-400 w-8 text-center" />
                                <button onClick={() => {
                                  const newReqs = analysisResult.tenderRequirements.filter((_, idx) => idx !== i);
                                  setAnalysisResult({...analysisResult, tenderRequirements: newReqs});
                                }} className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === 'technical' && (
                        <div className="space-y-4">
                          {analysisResult.technicalParameters.map((param, i) => (
                            <div key={i} className="p-4 bg-white rounded-lg border border-slate-100 space-y-3 group">
                              <div className="flex justify-between items-center">
                                <EditableText value={param.parameter} onChange={(v) => updateTechnicalParam(i, 'parameter', v)} className="text-sm font-bold" />
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded font-bold">{param.type}</span>
                                  <button onClick={() => {
                                    const newParams = analysisResult.technicalParameters.filter((_, idx) => idx !== i);
                                    setAnalysisResult({...analysisResult, technicalParameters: newParams});
                                  }} className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-[10px] text-slate-400 block mb-1">要求值</label>
                                  <EditableText value={param.value} onChange={(v) => updateTechnicalParam(i, 'value', v)} className="text-xs" />
                                </div>
                                <div>
                                  <label className="text-[10px] text-slate-400 block mb-1">允许偏差</label>
                                  <EditableText value={param.tolerance} onChange={(v) => updateTechnicalParam(i, 'tolerance', v)} className="text-xs" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === 'qualifications' && (
                        <div className="space-y-4">
                          {analysisResult.bidderQualifications.map((q, i) => (
                            <div key={i} className="p-4 bg-white rounded-lg border border-slate-100 flex gap-4 group">
                              <div className={cn(
                                "px-2 py-1 rounded text-[10px] font-bold h-fit shrink-0",
                                q.category === 'Mandatory' ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                              )}>{q.category === 'Mandatory' ? '强制' : '建议'}</div>
                              <div className="flex-1">
                                <EditableText multiline value={q.requirement} onChange={(v) => updateQualification(i, 'requirement', v)} className="text-sm leading-relaxed" />
                              </div>
                              <button onClick={() => {
                                const newQuals = analysisResult.bidderQualifications.filter((_, idx) => idx !== i);
                                setAnalysisResult({...analysisResult, bidderQualifications: newQuals});
                              }} className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all self-start"><Trash2 size={14} /></button>
                            </div>
                          ))}
                        </div>
                      )}

                      {activeTab === 'scoring' && (
                        <div className="space-y-4">
                          {analysisResult.scoringCriteria.map((s, i) => (
                            <div key={i} className="p-4 bg-white rounded-lg border border-slate-100 flex items-start gap-4 group">
                              <div className="w-12 h-12 bg-blue-50 rounded-lg flex flex-col items-center justify-center shrink-0 border border-blue-100">
                                <EditableText value={s.weight} onChange={(v) => updateScoring(i, 'weight', v)} className="text-lg font-bold text-blue-600" />
                                <span className="text-[8px] text-slate-400 font-bold">权重</span>
                              </div>
                              <div className="flex-1 space-y-1">
                                <EditableText value={s.criterion} onChange={(v) => updateScoring(i, 'criterion', v)} className="text-sm font-bold text-slate-900" />
                                <EditableText multiline value={s.description} onChange={(v) => updateScoring(i, 'description', v)} className="text-xs text-slate-500 leading-relaxed" />
                              </div>
                              <button onClick={() => {
                                const newScoring = analysisResult.scoringCriteria.filter((_, idx) => idx !== i);
                                setAnalysisResult({...analysisResult, scoringCriteria: newScoring});
                              }} className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex justify-between">
                      <button onClick={handleBack} className="px-6 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">返回修改</button>
                      <button 
                        onClick={() => setCurrentStep(4)}
                        className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                      >
                        确认并生成成果包
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Final Output (Final Output) */}
            {currentStep === 4 && (
              <div className="space-y-8 py-4">
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">招标策划成果已就绪</h2>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">系统已整合所有核心要素，生成了完整的招标策划成果包。</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: '采购需求说明', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
                    { title: '技术规范', icon: AlignLeft, color: 'text-purple-500', bg: 'bg-purple-50' },
                    { title: '投标人资格条件', icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50' },
                    { title: '评标办法', icon: ListChecks, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { title: '招标策划报告', icon: Sparkles, color: 'text-blue-500', bg: 'bg-blue-50' }
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-white border border-slate-100 rounded-xl flex items-center gap-4 hover:border-blue-200 transition-all group">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", item.bg, item.color)}>
                        <item.icon size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-slate-900">{item.title}</div>
                        <div className="text-[10px] text-slate-400">已生成 · 支持在线编辑</div>
                      </div>
                      <button className="p-2 text-slate-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all">
                        <Pencil size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
                  <div className="flex gap-4">
                    <button onClick={handleExport} className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center gap-2">
                      <Download size={18} />
                      导出招标策划方案 (Word)
                    </button>
                    <button onClick={() => handleComplete('workspace')} className="px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-500/20">
                      进入项目工作台
                      <ArrowRight size={18} />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">支持导出格式：WORD / PDF</p>
                </div>
              </div>
            )}
          </motion.div>
          </div>
        </div>
      </div>
    );
  };

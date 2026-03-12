import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  ArrowRight,
  Clock,
  LayoutDashboard, 
  FileText, 
  BarChart3, 
  Gavel, 
  FileCheck, 
  Save, 
  Download, 
  Plus, 
  Search, 
  History, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  BrainCircuit,
  PenTool,
  Home,
  Users,
  ShieldAlert,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { analyzeTenderRequirements } from '@/services/gemini';
import { ProjectStatus } from '@/types';

// --- Mock Data for Reference Projects ---
const MOCK_REFERENCE_PROJECTS = [
  { id: 1, name: '2024年智慧园区安防一期项目', budget: '450万', supplier: '海康威视', date: '2024-05', similarity: 92 },
  { id: 2, name: '某市交通局指挥中心升级改造', budget: '680万', supplier: '大华股份', date: '2023-11', similarity: 85 },
  { id: 3, name: '企业总部大楼弱电智能化工程', budget: '1200万', supplier: '太极计算机', date: '2024-02', similarity: 78 },
  { id: 4, name: '数据中心机房扩容采购', budget: '320万', supplier: '华为技术', date: '2023-08', similarity: 65 },
];

export const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('requirements');
  const [isLoading, setIsLoading] = useState(false);

  // Project State (In a real app, this would come from an API/Database)
  const [project, setProject] = useState<any>(null);

  const calculateProgress = (completedSteps: string[]) => {
    const totalSteps = 5;
    return Math.round((completedSteps.length / totalSteps) * 100);
  };

  const calculateStatus = (completedSteps: string[]) => {
    if (completedSteps.length === 5) return '已完成';
    if (completedSteps.length > 0) return '进行中';
    return '策划中';
  };

  const handleNextStep = () => {
    if (!project) return;
    
    let newCompletedSteps = [...project.completedSteps];
    if (!newCompletedSteps.includes(activeTab)) {
      newCompletedSteps.push(activeTab);
    }

    const newProgress = calculateProgress(newCompletedSteps);
    const newStatus = calculateStatus(newCompletedSteps);
    
    const updatedProject = { 
      ...project, 
      completedSteps: newCompletedSteps, 
      progress: newProgress, 
      status: newStatus 
    };
    
    setProject(updatedProject);
    saveProject(updatedProject);

    const tabs = ['requirements', 'technical', 'qualifications', 'evaluation', 'planning'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    } else {
      toast.success("所有步骤已完成！");
    }
  };

  const handleGeneratePlanning = () => {
    if (!project) return;
    
    const content = `
# ${project.name} - 招标策划方案书

## 1. 项目基本信息
- 预算规模: ${project.budget}万元
- 采购类型: ${project.type === 'service' ? '服务类' : project.type === 'goods' ? '货物类' : '工程类'}
- 项目背景: ${project.background}

## 2. 核心指标
- 投资规模: ${project.coreIndicators?.investmentScale || '未指定'}
- 交付周期: ${project.coreIndicators?.deliveryCycle || '未指定'}
- 采购范围: ${project.coreIndicators?.procurementScope || '未指定'}
- 建设内容: ${project.coreIndicators?.constructionContent || '未指定'}

## 3. 采购需求
${(project.tenderRequirements || []).map((req: any, i: number) => `${i + 1}. ${req.item}\n   描述: ${req.description}`).join('\n')}

## 4. 技术参数
${(project.technicalParameters || []).map((param: any, i: number) => `${i + 1}. ${param.parameter}\n   值: ${param.value}\n   类型: ${param.type}`).join('\n')}

## 5. 资格条件
${(project.qualifications || []).map((qual: any, i: number) => `${i + 1}. ${qual.category}\n   要求: ${qual.requirement}`).join('\n')}

## 6. 评标办法
${(project.scoringCriteria || []).map((score: any, i: number) => `${i + 1}. ${score.criterion} (${score.weight})\n   分类: ${score.category}\n   说明: ${score.description}`).join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}_招标策划方案书.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("招标策划方案书生成成功！");
  };

  const handleGenerateDraft = () => {
    if (!project) return;
    
    const content = `
# ${project.name} - 招标文件草案

## 第一章 招标公告
本项目（${project.name}）已由相关部门批准，资金来源为自筹，预算金额为 ${project.budget} 万元。

## 第二章 投标人须知
### 1. 资格条件
${(project.qualifications || []).map((qual: any, i: number) => `${i + 1}. ${qual.requirement}`).join('\n')}

## 第三章 评标办法
本项目采用综合评分法，满分为100分。
${(project.scoringCriteria || []).map((score: any, i: number) => `${i + 1}. ${score.criterion} (${score.weight})\n   ${score.description}`).join('\n')}

## 第四章 采购需求与技术要求
### 1. 采购需求
${(project.tenderRequirements || []).map((req: any, i: number) => `${i + 1}. ${req.item}: ${req.description}`).join('\n')}

### 2. 技术参数
${(project.technicalParameters || []).map((param: any, i: number) => `${i + 1}. ${param.parameter} (${param.type}): ${param.value}`).join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}_招标文件草案.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("招标文件草案生成成功！");
  };

  // Load project data
  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    const foundProject = savedProjects.find((p: any) => p.id === id);
    
    if (foundProject) {
      // Merge with default structure if fields are missing
      setProject({
        ...foundProject,
        requirements: foundProject.requirements || '',
        marketAnalysis: foundProject.marketAnalysis || '',
        scoringWeights: foundProject.scoringWeights || { technical: 50, price: 30, business: 20 },
        qualifications: foundProject.qualifications || [],
        risks: foundProject.risks || [],
        coreIndicators: foundProject.coreIndicators || {
          investmentScale: foundProject.budget ? `${foundProject.budget}万元` : '',
          deliveryCycle: '',
          technicalStandards: '',
          qualityRequirements: '',
          procurementScope: '',
          constructionContent: ''
        },
        technicalParameters: foundProject.technicalParameters || [],
        requirementList: foundProject.tenderRequirements || foundProject.requirementList || [],
        selectedReferences: foundProject.referenceProjects || foundProject.selectedReferences || [],
        industryBenchmarks: foundProject.industryBenchmarks || [],
        policyCompliance: foundProject.policyCompliance || [],
        productAdvice: foundProject.productAdvice || null,
        status: foundProject.status || '策划中',
        completedSteps: foundProject.completedSteps || []
      });
    } else {
      // Fallback for demo if ID doesn't exist in localstorage (e.g. direct link)
      setProject({
        id: id,
        name: '示例项目',
        budget: '500',
        type: 'service',
        status: '策划中',
        completedSteps: [],
        requirements: '',
        selectedReferences: [],
        scoringWeights: { technical: 50, price: 30, business: 20 },
        qualifications: [],
        risks: [],
        coreIndicators: {
          investmentScale: '500万元',
          deliveryCycle: '180天',
          technicalStandards: '符合GB/T 20271-2006信息安全技术通用设计要求',
          qualityRequirements: '系统可用性不低于99.9%',
          procurementScope: '智慧园区安防系统一期建设',
          constructionContent: '包含监控系统、门禁系统、周界报警系统及配套机房建设'
        },
        technicalParameters: [],
        requirementList: [],
        industryBenchmarks: [],
        policyCompliance: []
      });
    }
  }, [id]);

  const saveProject = (projectToSave: any) => {
    const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    const updatedProjects = savedProjects.map((p: any) => p.id === id ? { ...projectToSave, lastUpdate: '刚刚' } : p);
    
    if (!savedProjects.find((p: any) => p.id === id)) {
      updatedProjects.unshift({ ...projectToSave, lastUpdate: '刚刚' });
    }
    
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
  };

  const handleSave = () => {
    if (!project) return;
    saveProject(project);
    toast.success("项目进度已保存", {
      description: "所有更改已同步至本地存储",
      duration: 2000,
    });
  };

  // Keyboard shortcut for saving
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project]);

  const handleAIAnalysis = async () => {
    if (!project.requirements) {
      toast.error("请先输入项目需求");
      return;
    }
    setIsLoading(true);
    try {
      // Simulate AI Analysis
      const result = await analyzeTenderRequirements(project.requirements);
      
      setProject((prev: any) => ({
        ...prev,
        marketAnalysis: result.marketAnalysis,
        risks: result.riskAssessment,
        qualifications: result.bidderQualifications,
        coreIndicators: result.coreIndicators,
        technicalParameters: result.technicalParameters,
        requirementList: result.tenderRequirements,
        scoringCriteria: result.scoringCriteria,
        productAdvice: result.productAdvice,
        // Mocking benchmarks and policy for demo
        industryBenchmarks: [
          { name: '行业平均交付周期', value: '150-200天', status: 'normal' },
          { name: '同类项目平均预算', value: '480-550万元', status: 'warning' }
        ],
        policyCompliance: [
          { title: '政府采购法', content: '符合第八条供应商资格规定', status: 'pass' },
          { title: '等保2.0', content: '需满足三级安全保护要求', status: 'info' }
        ],
        // Auto-select references if empty
        selectedReferences: result.referenceProjects || prev.selectedReferences || MOCK_REFERENCE_PROJECTS.slice(0, 2),
        status: '策划中'
      }));
      toast.success("智能解析完成，请校验结果");
      setActiveTab('requirements');
    } catch (e) {
      toast.error("分析失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  if (!project) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-blue-100 px-8 py-5 flex items-center justify-between sticky top-0 z-20 shadow-sm relative overflow-hidden">
        {/* Subtle background gradient for header */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-transparent to-blue-50/50 pointer-events-none" />
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-blue-100 shadow-sm">
            <button onClick={() => navigate('/')} className="p-2.5 hover:bg-blue-50 rounded-xl text-blue-800/60 transition-all" title="回到首页">
              <Home size={20} strokeWidth={2} />
            </button>
            <div className="h-6 w-px bg-blue-100 mx-0.5"></div>
            <button onClick={() => navigate('/projects')} className="p-2.5 hover:bg-blue-50 rounded-xl text-blue-800/60 transition-all" title="返回项目列表">
              <ArrowLeft size={20} strokeWidth={2} />
            </button>
          </div>
          <div>
            <div className="flex items-center gap-4 mb-1.5">
              <h1 className="text-xl font-bold text-blue-950 flex items-center gap-3">
                <input 
                  type="text" 
                  value={project.name} 
                  onChange={(e) => setProject({...project, name: e.target.value})}
                  className="bg-transparent border-none p-0 focus:ring-0 text-xl font-bold text-blue-950 w-full placeholder-blue-300"
                  placeholder="输入项目名称..."
                />
                <PenTool size={16} className="text-blue-300 hover:text-blue-600 cursor-pointer shrink-0" />
              </h1>
              <span className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border whitespace-nowrap",
                project.status === '已完成' ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-blue-100 text-blue-800 border-blue-200"
              )}>
                {project.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-blue-800/60">
              <span className="font-mono bg-blue-50 px-2.5 py-1 rounded-lg text-blue-700">{project.id}</span>
              <span className="flex items-center gap-1.5"><Clock size={14} /> 最后更新: {project.lastUpdate || '刚刚'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <button onClick={handleSave} className="flex items-center gap-2.5 px-6 py-3 text-sm font-bold text-blue-950 bg-white hover:bg-blue-50 rounded-2xl border border-blue-100 shadow-sm transition-all hover:shadow">
            <Save size={18} className="text-blue-600" />
            保存进度
          </button>
          <button className="flex items-center gap-2.5 px-6 py-3 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40">
            <Download size={18} />
            导出方案
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-80 bg-white/50 backdrop-blur-sm border-r border-blue-100 flex flex-col py-8 relative z-10">
          <div className="px-8 mb-6">
            <div className="text-[11px] font-bold text-blue-800/50 uppercase tracking-wider mb-4">策划流程</div>
            <div className="h-2.5 w-full bg-blue-100 rounded-full overflow-hidden mb-3">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${project.progress || 0}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs font-bold text-blue-800/70">
              <span>完成度</span>
              <span className="text-blue-700">{project.progress || 0}%</span>
            </div>
          </div>

          <nav className="space-y-2 px-5 mt-2">
            {[
              { id: 'requirements', label: '1. 采购需求说明', icon: FileText, desc: '项目背景与核心指标' },
              { id: 'technical', label: '2. 技术规范参数', icon: BarChart3, desc: '功能要求与技术标准' },
              { id: 'qualifications', label: '3. 投标人资格', icon: Users, desc: '准入条件与业绩要求' },
              { id: 'evaluation', label: '4. 评标办法标准', icon: Gavel, desc: '评分细则与权重分配' },
              { id: 'planning', label: '5. 招标策划方案', icon: FileCheck, desc: '最终成果包与风险评估' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-start gap-4 px-5 py-4 rounded-2xl transition-all text-left group",
                  activeTab === item.id 
                    ? "bg-blue-100/50 border border-blue-200 shadow-sm" 
                    : "border border-transparent hover:bg-blue-50/50"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-colors shrink-0 mt-0.5",
                  project.completedSteps.includes(item.id) 
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30" 
                    : activeTab === item.id
                      ? "border-blue-500 bg-white text-blue-600"
                      : "border-blue-200 bg-white text-blue-300 group-hover:border-blue-300"
                )}>
                  {project.completedSteps.includes(item.id) ? <CheckCircle2 size={18} strokeWidth={2.5} /> : <div className="w-2 h-2 rounded-full bg-current opacity-50" />}
                </div>
                <div>
                  <div className={cn(
                    "text-sm font-bold mb-1 transition-colors",
                    activeTab === item.id ? "text-blue-900" : "text-blue-950 group-hover:text-blue-700"
                  )}>
                    {item.label}
                  </div>
                  <div className="text-xs text-blue-800/60 font-medium">{item.desc}</div>
                </div>
              </button>
            ))}
          </nav>
          
          <div className="mt-auto px-8 pb-8 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full" />
              <div className="text-xs font-bold text-blue-950 mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-600" />
                项目状态
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                <span className="text-xs text-emerald-800 font-bold tracking-wide">策划成果包已生成</span>
              </div>
              <p className="text-xs text-blue-800/70 leading-relaxed font-medium">包含 5 类核心交付物，可直接导出招标文件草案</p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/30">
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-5xl mx-auto">
            
            {/* 1. 采购需求说明 */}
            {activeTab === 'requirements' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-2 space-y-6">
                      <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                      <h3 className="text-base font-semibold text-blue-950 mb-4 flex items-center gap-2">
                        <FileText size={18} className="text-blue-600" />
                        项目背景与概况
                      </h3>
                      <textarea 
                        className="w-full h-32 text-sm text-blue-800/70 border-none resize-none focus:ring-0 bg-transparent p-0"
                        value={project.background || "暂无背景描述..."}
                        onChange={(e) => setProject({...project, background: e.target.value})}
                        placeholder="请输入项目背景..."
                      />
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-semibold text-blue-950 flex items-center gap-2">
                          <Sparkles size={18} className="text-blue-600" />
                          核心指标识别
                        </h3>
                        <span className="text-[11px] text-blue-700 bg-blue-50/80 px-2.5 py-1 rounded-md font-medium border border-blue-100/50">AI 自动提取</span>
                      </div>
                      <div className="grid grid-cols-2 gap-5">
                        <div className="p-4 bg-blue-50/30 rounded-lg border border-blue-100/50 transition-colors hover:bg-blue-50/50">
                          <label className="text-xs font-medium text-blue-900/60 block mb-1.5">投资规模</label>
                          <input 
                            className="text-sm font-semibold text-slate-900 bg-transparent border-none p-0 focus:ring-0 w-full"
                            value={project.coreIndicators?.investmentScale}
                            onChange={(e) => setProject({...project, coreIndicators: {...project.coreIndicators, investmentScale: e.target.value}})}
                          />
                        </div>
                        <div className="p-4 bg-emerald-50/30 rounded-lg border border-emerald-100/50 transition-colors hover:bg-emerald-50/50">
                          <label className="text-xs font-medium text-emerald-900/60 block mb-1.5">交付周期</label>
                          <input 
                            className="text-sm font-semibold text-slate-900 bg-transparent border-none p-0 focus:ring-0 w-full"
                            value={project.coreIndicators?.deliveryCycle}
                            onChange={(e) => setProject({...project, coreIndicators: {...project.coreIndicators, deliveryCycle: e.target.value}})}
                          />
                        </div>
                        <div className="p-4 bg-blue-50/30 rounded-lg border border-blue-100/50 col-span-2 transition-colors hover:bg-blue-50/50">
                          <label className="text-xs font-medium text-blue-900/60 block mb-1.5">采购范围</label>
                          <textarea 
                            className="text-sm text-slate-700 bg-transparent border-none p-0 focus:ring-0 w-full resize-none h-12"
                            value={project.coreIndicators?.procurementScope}
                            onChange={(e) => setProject({...project, coreIndicators: {...project.coreIndicators, procurementScope: e.target.value}})}
                          />
                        </div>
                        <div className="p-4 bg-purple-50/30 rounded-lg border border-purple-100/50 col-span-2 transition-colors hover:bg-purple-50/50">
                          <label className="text-xs font-medium text-purple-900/60 block mb-1.5">建设内容</label>
                          <textarea 
                            className="text-sm text-slate-700 bg-transparent border-none p-0 focus:ring-0 w-full resize-none h-12"
                            value={project.coreIndicators?.constructionContent}
                            onChange={(e) => setProject({...project, coreIndicators: {...project.coreIndicators, constructionContent: e.target.value}})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm space-y-5">
                      <div>
                        <label className="text-xs font-medium text-blue-800/60 block mb-2">预算金额 (万元)</label>
                        <input 
                          type="text" 
                          value={project.budget} 
                          onChange={(e) => setProject({...project, budget: e.target.value})}
                          className="text-3xl font-light text-blue-950 w-full border-none p-0 focus:ring-0" 
                        />
                      </div>
                      <div className="pt-5 border-t border-blue-100">
                        <label className="text-xs font-medium text-blue-800/60 block mb-2">质量要求</label>
                        <textarea 
                          className="text-sm text-blue-800/70 bg-transparent border-none p-0 focus:ring-0 w-full resize-none h-20"
                          value={project.coreIndicators?.qualityRequirements}
                          onChange={(e) => setProject({...project, coreIndicators: {...project.coreIndicators, qualityRequirements: e.target.value}})}
                        />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl p-6 shadow-md relative overflow-hidden text-white">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400/20 rounded-full -ml-12 -mb-12 blur-xl"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4 text-blue-100">
                          <BrainCircuit size={20} className="text-blue-200" />
                          <h4 className="font-semibold text-sm tracking-wide">AI 需求增强</h4>
                        </div>
                        <p className="text-xs text-blue-100/80 leading-relaxed mb-6">
                          基于您的原始需求，AI 已自动补全了采购范围与建设内容。建议核对交付周期是否符合行业标准。
                        </p>
                        <button 
                          onClick={handleAIAnalysis}
                          className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-all border border-white/20 backdrop-blur-sm shadow-sm"
                        >
                          重新解析需求
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. 技术规范与技术参数 */}
            {activeTab === 'technical' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                          <BarChart3 size={18} className="text-blue-600" />
                          核心技术参数标准
                        </h3>
                        <span className="text-[11px] text-blue-700 bg-blue-50/80 px-2.5 py-1 rounded-md font-medium border border-blue-100/50">可量化指标</span>
                      </div>
                      <div className="space-y-3">
                        {project.technicalParameters?.length > 0 ? (
                          project.technicalParameters.map((param: any, i: number) => (
                            <div key={i} className={cn(
                              "flex items-start gap-4 p-4 rounded-lg border transition-colors group",
                              param.type === 'Functional' ? "bg-blue-50/30 border-blue-100/50 hover:border-blue-300" :
                              param.type === 'Performance' ? "bg-purple-50/30 border-purple-100/50 hover:border-purple-300" : 
                              param.type === 'Safety' ? "bg-red-50/30 border-red-100/50 hover:border-red-300" : "bg-slate-50/50 border-slate-200/60 hover:border-slate-300"
                            )}>
                              <div className={cn(
                                "px-2 py-1 rounded text-[10px] font-semibold text-white shrink-0 mt-0.5",
                                param.type === 'Functional' ? "bg-blue-500" :
                                param.type === 'Performance' ? "bg-purple-500" : 
                                param.type === 'Safety' ? "bg-red-500" : "bg-slate-500"
                              )}>
                                {param.type === 'Functional' ? '功能' : 
                                 param.type === 'Performance' ? '性能' : 
                                 param.type === 'Safety' ? '安全' : '通用'}
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-semibold text-slate-900 flex justify-between">
                                  {param.parameter}
                                  <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-opacity">
                                    <PenTool size={14} />
                                  </button>
                                </div>
                                <div className="text-xs text-slate-600 mt-2 flex flex-wrap gap-x-5 gap-y-2">
                                  <span>标准值: <span className="text-slate-900 font-medium">{param.value}</span></span>
                                  <span>偏差允许: <span className="text-slate-900 font-medium">{param.tolerance}</span></span>
                                </div>
                                {param.source && (
                                  <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center gap-2 text-[11px]">
                                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">{param.source.tier}</span>
                                    <span className="text-slate-500">{param.source.name}</span>
                                    {param.source.url && (
                                      <a href={param.source.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 ml-auto font-medium">
                                        <LinkIcon size={12} /> 来源链接
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 text-slate-400 text-sm flex flex-col items-center gap-3">
                            <Search size={28} className="opacity-20" />
                            暂无技术参数，请先进行 AI 解析
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
                      <h3 className="text-base font-semibold text-slate-900 mb-5">功能需求详细说明</h3>
                      <div className="space-y-3">
                        {project.requirementList?.map((item: any, i: number) => (
                          <div key={i} className="p-4 bg-slate-50/50 rounded-lg border border-slate-200/60 transition-colors hover:bg-slate-100/50">
                            <div className="text-sm font-semibold text-slate-900 mb-1.5">{item.item}</div>
                            <div className="text-xs text-slate-600 leading-relaxed">{item.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
                      <h3 className="text-base font-semibold text-slate-900 mb-4">技术标准合规性</h3>
                      <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-200/60 text-xs text-emerald-800 leading-relaxed">
                        <div className="font-semibold mb-2 flex items-center gap-1.5">
                          <CheckCircle2 size={14} className="text-emerald-600" />
                          符合国家标准
                        </div>
                        当前参数设置已参考 GB/T 20271-2006 及相关行业规范，确保招标过程中的技术合规性。
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
                      <h3 className="text-base font-semibold text-slate-900 mb-4">安全与质量标准</h3>
                      <textarea 
                        className="w-full h-32 text-xs text-slate-700 bg-slate-50/50 p-4 rounded-lg border border-slate-200/60 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none transition-all"
                        value={project.coreIndicators?.technicalStandards}
                        onChange={(e) => setProject({...project, coreIndicators: {...project.coreIndicators, technicalStandards: e.target.value}})}
                        placeholder="请输入安全与质量标准..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. 投标人资格条件 */}
            {activeTab === 'qualifications' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                          <Users size={18} className="text-blue-600" />
                          准入条件清单
                        </h3>
                        <button className="text-xs text-blue-600 font-medium hover:text-blue-700 transition-colors flex items-center gap-1">
                          <Plus size={14} /> 添加条件
                        </button>
                      </div>
                      <div className="space-y-3">
                        {project.qualifications?.map((q: any, i: number) => (
                          <div key={i} className={cn(
                            "flex items-start gap-4 p-4 rounded-lg border transition-colors group",
                            q.category?.includes('强制') ? "bg-red-50/30 border-red-100/50 hover:border-red-300" : "bg-emerald-50/30 border-emerald-100/50 hover:border-emerald-300"
                          )}>
                            <div className={cn(
                              "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
                              q.category?.includes('强制') ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            )}>
                              {q.category?.includes('强制') ? <ShieldAlert size={16} /> : <CheckCircle2 size={16} />}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <span className={cn(
                                  "text-[10px] font-semibold px-2 py-0.5 rounded-md mb-2 inline-block border",
                                  q.category?.includes('强制') ? "bg-red-50 text-red-700 border-red-200/60" : "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                                )}>
                                  {q.category?.includes('强制') ? '强制性条款' : '加分项/建议项'}
                                </span>
                                <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity">
                                  <PenTool size={14} />
                                </button>
                              </div>
                              <p className="text-sm text-slate-700 leading-relaxed">{q.requirement}</p>
                              {q.source && (
                                <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center gap-2 text-[11px]">
                                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">{q.source.tier}</span>
                                  <span className="text-slate-500">{q.source.name}</span>
                                  {q.source.url && (
                                    <a href={q.source.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 ml-auto font-medium">
                                      <LinkIcon size={12} /> 来源链接
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
                      <h3 className="text-base font-semibold text-slate-900 mb-5">业绩与信誉要求</h3>
                      <div className="grid grid-cols-2 gap-5">
                        <div className="p-5 bg-slate-50/50 rounded-lg border border-slate-200/60 transition-colors hover:bg-slate-100/50">
                          <h4 className="text-[11px] font-semibold text-slate-500 mb-2.5 uppercase tracking-wider">企业业绩</h4>
                          <p className="text-sm text-slate-700 leading-relaxed">近三年内具有不少于3个同类项目实施案例，单项合同金额不低于200万元。</p>
                        </div>
                        <div className="p-5 bg-slate-50/50 rounded-lg border border-slate-200/60 transition-colors hover:bg-slate-100/50">
                          <h4 className="text-[11px] font-semibold text-slate-500 mb-2.5 uppercase tracking-wider">人员要求</h4>
                          <p className="text-sm text-slate-700 leading-relaxed">项目经理需具备高级工程师职称及PMP证书，核心团队成员不少于5人。</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
                      <h3 className="text-base font-semibold text-slate-900 mb-5">市场准入分析</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-slate-600 font-medium">潜在供应商匹配度</span>
                          <span className="font-semibold text-blue-600">85%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 w-[85%] rounded-full"></div>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed pt-2">
                          当前资格条件设置合理，预计可吸引 8-12 家符合条件的优质供应商参与投标。
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
                      <h3 className="text-base font-semibold text-slate-900 mb-5">相似项目参考</h3>
                      <div className="space-y-4">
                        {project.selectedReferences?.length > 0 ? (
                          project.selectedReferences.map((ref: any, i: number) => (
                            <div key={i} className="p-4 bg-blue-50/30 rounded-lg border border-blue-100/50 transition-colors hover:bg-blue-50/50">
                              <div className="flex justify-between items-start mb-3">
                                <div className="font-semibold text-slate-900 text-sm">{ref.projectName || ref.name}</div>
                                <div className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium border border-blue-100/50">相似度: {ref.similarity}%</div>
                              </div>
                              <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="text-xs text-slate-500">中标金额: <span className="text-slate-900 font-medium">{ref.winningBidAmount || ref.budget}</span></div>
                                {ref.date && <div className="text-xs text-slate-500">时间: <span className="text-slate-900 font-medium">{ref.date}</span></div>}
                                {ref.supplier && <div className="text-xs text-slate-500 col-span-2">中标供应商: <span className="text-slate-900 font-medium">{ref.supplier}</span></div>}
                              </div>
                              {ref.successFactors && (
                                <div className="text-xs text-slate-600 mb-2 leading-relaxed">
                                  <span className="font-semibold text-slate-900">成功要素:</span> {ref.successFactors}
                                </div>
                              )}
                              {ref.keyTakeaway && (
                                <div className="text-xs text-slate-600 leading-relaxed">
                                  <span className="font-semibold text-slate-900">核心借鉴:</span> {ref.keyTakeaway}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-slate-400 text-sm">暂无相似项目参考</div>
                        )}
                      </div>
                    </div>

                    <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-5">
                      <div className="flex items-center gap-2 text-amber-700 mb-3">
                        <AlertTriangle size={18} />
                        <h4 className="font-semibold text-sm">合规性预警</h4>
                      </div>
                      <p className="text-xs text-amber-800/80 leading-relaxed">
                        请注意：设置过高的业绩要求可能构成“以不合理的条件限制、排斥潜在投标人”。建议根据项目实际规模调整。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. 评标办法与评分标准 */}
            {activeTab === 'evaluation' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                          <Gavel size={18} className="text-blue-600" />
                          评分指标详细设置
                        </h3>
                        <button className="text-xs text-indigo-600 font-medium hover:text-indigo-700 transition-colors flex items-center gap-1">
                          <Plus size={14} /> 添加指标
                        </button>
                      </div>
                      <div className="space-y-4">
                        {project.scoringCriteria?.map((s: any, i: number) => (
                          <div key={i} className={cn(
                            "flex items-start gap-5 p-5 rounded-lg border transition-colors group",
                            s.category === 'Technical' ? "bg-blue-50/30 border-blue-100/50 hover:border-blue-300" :
                            s.category === 'Price' ? "bg-emerald-50/30 border-emerald-100/50 hover:border-emerald-300" : "bg-purple-50/30 border-purple-100/50 hover:border-purple-300"
                          )}>
                            <div className="w-12 text-center shrink-0 pt-1">
                              <div className="text-2xl font-light text-indigo-600">{s.weight}</div>
                              <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest mt-1">WEIGHT</div>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <span className={cn(
                                  "text-[10px] font-semibold px-2 py-0.5 rounded-md border",
                                  s.category === 'Technical' ? "bg-blue-50 text-blue-700 border-blue-200/60" :
                                  s.category === 'Price' ? "bg-emerald-50 text-emerald-700 border-emerald-200/60" : "bg-purple-50 text-purple-700 border-purple-200/60"
                                )}>
                                  {s.category === 'Technical' ? '技术部分' : 
                                   s.category === 'Price' ? '价格部分' : '商务部分'}
                                </span>
                                <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity">
                                  <PenTool size={14} />
                                </button>
                              </div>
                              <h4 className="text-sm font-semibold text-slate-900 mb-1.5">{s.criterion}</h4>
                              <p className="text-xs text-slate-600 leading-relaxed">{s.description}</p>
                              {s.source && (
                                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center gap-2 text-[11px]">
                                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">{s.source.tier}</span>
                                  <span className="text-slate-500">{s.source.name}</span>
                                  {s.source.url && (
                                    <a href={s.source.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 ml-auto font-medium">
                                      <LinkIcon size={12} /> 来源链接
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
                      <h3 className="text-base font-semibold text-slate-900 mb-6">权重分配概览</h3>
                      <div className="space-y-6">
                        {['technical', 'price', 'business'].map((type) => (
                          <div key={type}>
                            <div className="flex justify-between text-xs mb-2">
                              <span className="text-slate-600 font-medium">{type === 'technical' ? '技术分' : type === 'price' ? '价格分' : '商务分'}</span>
                              <span className="font-semibold text-slate-900">{project.scoringWeights[type]}%</span>
                            </div>
                            <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${project.scoringWeights[type]}%` }}
                                className={cn(
                                  "h-full rounded-full",
                                  type === 'technical' ? "bg-blue-500" :
                                  type === 'price' ? "bg-emerald-500" : "bg-purple-500"
                                )}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-8 pt-6 border-t border-slate-200/60">
                        <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                          <span>总计</span>
                          <span className={cn(
                            (project.scoringWeights.technical + project.scoringWeights.price + project.scoringWeights.business) === 100 
                              ? "text-emerald-600" : "text-red-600"
                          )}>
                            {project.scoringWeights.technical + project.scoringWeights.price + project.scoringWeights.business}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 rounded-xl p-6 text-white shadow-sm">
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-400" />
                        评标办法建议
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        建议采用“综合评分法”。技术分占比 50% 可确保项目实施质量，价格分 30% 符合合规性要求。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. 招标策划方案/草案 */}
            {activeTab === 'planning' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white p-10 rounded-xl border border-slate-200/80 shadow-sm text-center">
                  <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100/50">
                    <FileCheck className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-900">招标策划成果包已就绪</h2>
                  <p className="text-sm text-slate-500 mt-4 max-w-2xl mx-auto leading-relaxed">
                    系统已通过智能化分析帮助您快速锁定最优方案，提升招标策划的效率与精准度，减少人为因素导致的误差和主观判断偏差，实现招采全流程的降本、提质、控风险。
                  </p>
                  
                  <div className="grid grid-cols-3 gap-6 mt-10 max-w-3xl mx-auto">
                    <div className="p-5 bg-indigo-50/30 rounded-xl border border-indigo-100/50 flex flex-col items-center transition-colors hover:bg-indigo-50/50">
                      <div className="text-2xl font-light text-indigo-900 mb-1">5</div>
                      <div className="text-[11px] text-indigo-600/70 uppercase font-semibold tracking-wider">核心章节</div>
                    </div>
                    <div className="p-5 bg-blue-50/30 rounded-xl border border-blue-100/50 flex flex-col items-center transition-colors hover:bg-blue-50/50">
                      <div className="text-2xl font-light text-blue-900 mb-1">12</div>
                      <div className="text-[11px] text-blue-600/70 uppercase font-semibold tracking-wider">量化指标</div>
                    </div>
                    <div className="p-5 bg-emerald-50/30 rounded-xl border border-emerald-100/50 flex flex-col items-center transition-colors hover:bg-emerald-50/50">
                      <div className="text-2xl font-light text-emerald-900 mb-1">100%</div>
                      <div className="text-[11px] text-emerald-600/70 uppercase font-semibold tracking-wider">合规覆盖</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200/80 hover:border-indigo-300 transition-all cursor-pointer group shadow-sm">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-12 h-12 bg-indigo-50/80 rounded-lg flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform border border-indigo-100/50">
                        <FileText size={24} strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm">招标策划方案书.md</h3>
                        <p className="text-[11px] text-slate-500 mt-1">包含所有分析结果的完整策划报告</p>
                      </div>
                    </div>
                    <button onClick={handleGeneratePlanning} className="w-full py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-md shadow-sm group-hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                      <Download size={16} />
                      生成
                    </button>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-slate-200/80 hover:border-emerald-300 transition-all cursor-pointer group shadow-sm">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-12 h-12 bg-emerald-50/80 rounded-lg flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform border border-emerald-100/50">
                        <FileCheck size={24} strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm">招标文件草案.docx</h3>
                        <p className="text-[11px] text-slate-500 mt-1">基于策划成果自动生成的招标文件初稿</p>
                      </div>
                    </div>
                    <button onClick={handleGenerateDraft} className="w-full py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-md shadow-sm group-hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                      <Download size={16} />
                      生成
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {project.marketAnalysis && (
                    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
                      <h3 className="text-base font-semibold text-slate-900 mb-4">市场分析</h3>
                      <p className="text-sm text-slate-700 leading-relaxed">{project.marketAnalysis}</p>
                    </div>
                  )}
                  {project.risks && project.risks.length > 0 && (
                    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
                      <h3 className="text-base font-semibold text-slate-900 mb-5">风险评估</h3>
                      <ul className="space-y-3">
                        {project.risks.map((r: any, i: number) => (
                          <li key={i} className="flex gap-4 p-4 bg-amber-50/30 rounded-lg border border-amber-100/50 transition-colors hover:bg-amber-50/50">
                            <ShieldAlert size={18} className="text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <div className="text-sm font-semibold text-slate-900 mb-1.5">{r.risk}</div>
                              <div className="text-xs text-slate-600 leading-relaxed">建议应对: {r.mitigation}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {project.productAdvice && (
                    <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm">
                      <h3 className="text-base font-semibold text-slate-900 mb-5">产品选型建议</h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-200/60 transition-colors hover:bg-slate-100/50">
                          <span className="text-xs font-semibold text-slate-500 block mb-2 uppercase tracking-wider">推荐规格</span>
                          <div className="text-sm text-slate-700 leading-relaxed">{project.productAdvice.recommendedSpecs}</div>
                        </div>
                        <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-200/60 transition-colors hover:bg-slate-100/50">
                          <span className="text-xs font-semibold text-slate-500 block mb-2 uppercase tracking-wider">最佳策略</span>
                          <div className="text-sm text-slate-700 leading-relaxed">{project.productAdvice.bestChoice}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-900 rounded-xl p-8 text-white relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="relative z-10">
                    <h3 className="text-base font-semibold mb-5 flex items-center gap-2">
                      <Sparkles className="text-indigo-400" size={18} />
                      下一步建议
                    </h3>
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-200 mb-2.5">1. 内部评审</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          建议组织技术与财务部门对策划方案中的“技术参数”与“评分权重”进行内部会审，确保方案的可实施性。
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-200 mb-2.5">2. 市场调研</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          针对 AI 识别出的高风险项，建议进行小范围的市场调研，验证潜在投标人的响应能力。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}



          </div>
        </div>
        
        {activeTab !== 'planning' && (
          <div className="p-6 border-t border-blue-100 bg-white flex justify-center">
            <button 
              onClick={handleNextStep}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5"
            >
              下一步
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);
};

import React, { useState, useEffect } from 'react';
import { Plus, Upload, FileText, ArrowRight, Clock, CheckCircle2, PlayCircle, FileUp, Sparkles, Users, ShieldAlert, Scale, BookOpen, FolderOpen, BrainCircuit, Download, Trash2, BarChart3, Gavel, FileCheck, FileEdit, Sliders, UserCheck, FileSignature } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const initialProjects = [
  {
    id: 'PRJ-2026-001',
    name: '智慧城市交通信号优化系统采购',
    status: '进行中',
    progress: 35,
    budget: '￥4,500,000',
    department: '交通管理处',
    lastUpdate: '2小时前'
  },
  {
    id: 'PRJ-2026-002',
    name: '企业云平台扩容项目',
    status: '策划中',
    progress: 10,
    budget: '￥1,200,000',
    department: '信息技术部',
    lastUpdate: '昨天'
  },
  {
    id: 'PRJ-2026-003',
    name: '园区安防监控升级改造',
    status: '已完成',
    progress: 100,
    budget: '￥850,000',
    department: '后勤保障部',
    lastUpdate: '3天前'
  },
];

const ProcessStep = ({ number, title, description, icon: Icon, onClick }: { number: string, title: string, description: string, icon: any, onClick?: () => void }) => (
  <div className="flex flex-col items-center text-center group relative z-10 cursor-pointer" onClick={onClick}>
    <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-4 group-hover:border-blue-300 group-hover:shadow-md transition-all duration-300 relative">
      <Icon className="w-5 h-5 text-slate-500 group-hover:text-blue-600 transition-colors relative z-10 stroke-[1.5]" />
      <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 flex items-center justify-center border border-white group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors z-20">
        {number}
      </div>
    </div>
    <h3 className="text-sm font-semibold text-slate-900 mb-1 group-hover:text-blue-700 transition-colors">{title}</h3>
    <p className="text-[11px] text-slate-500 max-w-[120px] leading-relaxed">{description}</p>
  </div>
);

export const ProjectManagement = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(initialProjects);
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 5;

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(projects.length / projectsPerPage);

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除该项目吗？此操作不可逆。')) {
      const updatedProjects = projects.filter((p: any) => p.id !== id);
      setProjects(updatedProjects);
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
    }
  };

  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    if (savedProjects.length > 0) {
      // Merge saved projects with initial ones, avoiding duplicates
      const savedIds = new Set(savedProjects.map((p: any) => p.id));
      const uniqueInitialProjects = initialProjects.filter(p => !savedIds.has(p.id));
      setProjects([...savedProjects, ...uniqueInitialProjects]);
    }
  }, []);

  return (
    <div className="relative -m-4 lg:-m-6 p-4 lg:p-6 min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      
      <div className="max-w-7xl mx-auto space-y-8 pb-10 px-4 sm:px-6 relative z-10">
      <div className="py-10 flex flex-col items-start border-b border-blue-100 mb-8 relative">
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-20 top-0 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-semibold tracking-wide uppercase mb-6 shadow-lg shadow-blue-500/20 relative z-10">
          <Sparkles size={14} />
          Intelligent Tender System
        </div>
        <h1 className="text-5xl font-extrabold text-blue-950 mb-6 tracking-tight relative z-10">
          重塑招标策划全流程
        </h1>
        <p className="text-lg text-blue-800/80 max-w-2xl leading-relaxed mb-10 relative z-10">
          依托大模型技术，自动化解析需求文档，智能生成技术规范与评标办法，显著提升招标采购效率与合规性。
        </p>
        
        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full mt-2">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-blue-100 shadow-md shadow-blue-500/5 flex flex-col relative overflow-hidden hover:border-blue-300 transition-colors">
            <span className="text-[11px] text-blue-600 font-semibold uppercase tracking-wider mb-2">进行中项目</span>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-blue-950 leading-none">12</span>
              <span className="text-xs text-blue-600/70 font-medium mb-1">本周新增 3</span>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-blue-100 shadow-md shadow-blue-500/5 flex flex-col relative overflow-hidden hover:border-blue-300 transition-colors">
            <span className="text-[11px] text-blue-600 font-semibold uppercase tracking-wider mb-2">已完成策划</span>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-blue-950 leading-none">48</span>
              <span className="text-xs text-blue-600/70 font-medium mb-1">总计</span>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-blue-100 shadow-md shadow-blue-500/5 flex flex-col relative overflow-hidden hover:border-blue-300 transition-colors">
            <span className="text-[11px] text-blue-600 font-semibold uppercase tracking-wider mb-2">平均节省时间</span>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-blue-950 leading-none">65<span className="text-xl text-blue-400 ml-0.5">%</span></span>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-blue-100 shadow-md shadow-blue-500/5 flex flex-col relative overflow-hidden hover:border-blue-300 transition-colors">
            <span className="text-[11px] text-blue-600 font-semibold uppercase tracking-wider mb-2">合规风险拦截</span>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-blue-950 leading-none">156</span>
              <span className="text-xs text-blue-600/70 font-medium mb-1">项</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 border border-blue-100 shadow-lg shadow-blue-500/10 hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group relative overflow-hidden flex flex-col h-full items-center text-center"
          onClick={() => navigate('/projects/create?mode=upload')}
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-100/40 rounded-full blur-3xl group-hover:bg-blue-200/40 transition-colors duration-500"></div>
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-500/30 mb-8 relative z-10">
            <Upload className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h2 className="text-2xl font-bold text-blue-950 mb-4 relative z-10">上传需求文档</h2>
          <p className="text-sm text-blue-800/70 leading-relaxed mb-8 flex-1 relative z-10 max-w-xs">
            一键上传需求文档，AI 自动解析并生成方案，无需手动填写繁琐信息。
          </p>
          <button className="px-8 py-3 bg-blue-50 text-blue-700 rounded-2xl font-bold text-sm hover:bg-blue-100 transition-colors relative z-10">
            立即上传
          </button>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 border border-blue-100 shadow-lg shadow-blue-500/10 hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group relative overflow-hidden flex flex-col h-full items-center text-center"
          onClick={() => navigate('/projects/create?mode=manual')}
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-100/40 rounded-full blur-3xl group-hover:bg-blue-200/40 transition-colors duration-500"></div>
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-500/30 mb-8 relative z-10">
            <Plus className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h2 className="text-2xl font-bold text-blue-950 mb-4 relative z-10">新建空白项目</h2>
          <p className="text-sm text-blue-800/70 leading-relaxed mb-8 flex-1 relative z-10 max-w-xs">
            手动录入项目信息，适合无现成文档或需从头梳理需求的场景。
          </p>
          <button className="px-8 py-3 bg-blue-50 text-blue-700 rounded-2xl font-bold text-sm hover:bg-blue-100 transition-colors relative z-10">
            新建项目
          </button>
        </motion.div>
      </div>

      {/* Recently Created Projects */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm p-8">
        <h2 className="text-lg font-bold text-slate-950 mb-6">最近创建项目</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.slice(0, 6).map((project: any) => (
            <div key={project.id} className="bg-white border border-slate-100 rounded-2xl p-5 hover:border-blue-200 transition-all shadow-sm hover:shadow-md cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
              <div className="font-bold text-slate-950 mb-1 truncate">{project.name}</div>
              <div className="text-xs text-slate-500 font-mono mb-3">{project.id}</div>
              <div className="flex items-center justify-between text-xs">
                <span className={cn("px-2 py-0.5 rounded-full font-bold", project.status === '进行中' ? "bg-blue-50 text-blue-700" : "bg-slate-50 text-slate-600")}>{project.status}</span>
                <span className="text-slate-500">{project.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Process Overview - Full Width */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100 p-8 shadow-md shadow-blue-500/5">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-blue-950">招标策划准备流程</h2>
            <p className="text-sm text-blue-800/70 mt-1">标准化的 5 步流程，确保策划方案的合规与完整</p>
          </div>
        </div>
        
        <div className="relative max-w-5xl mx-auto">
          {/* Connecting Line */}
          <div className="absolute top-6 left-10 right-10 h-px bg-blue-200 hidden md:block" />
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
            <div className="flex flex-col items-center text-center group relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white border-2 border-blue-200 shadow-lg shadow-blue-500/10 flex items-center justify-center mb-4 relative">
                <FileEdit className="w-7 h-7 text-blue-600 relative z-10" />
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-600 text-[11px] font-bold text-white flex items-center justify-center border-2 border-white shadow-sm z-20">1</div>
              </div>
              <h3 className="text-sm font-bold text-blue-950 mb-1">需求录入</h3>
              <p className="text-[11px] text-blue-800/70 max-w-[120px] leading-relaxed">填写基本信息或上传文档</p>
            </div>
            
            <div className="flex flex-col items-center text-center group relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white border-2 border-blue-200 shadow-lg shadow-blue-500/10 flex items-center justify-center mb-4 relative">
                <Sliders className="w-7 h-7 text-blue-600 relative z-10" />
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-600 text-[11px] font-bold text-white flex items-center justify-center border-2 border-white shadow-sm z-20">2</div>
              </div>
              <h3 className="text-sm font-bold text-blue-950 mb-1">技术规范</h3>
              <p className="text-[11px] text-blue-800/70 max-w-[120px] leading-relaxed">AI 自动提取关键技术参数</p>
            </div>

            <div className="flex flex-col items-center text-center group relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white border-2 border-blue-200 shadow-lg shadow-blue-500/10 flex items-center justify-center mb-4 relative">
                <UserCheck className="w-7 h-7 text-blue-600 relative z-10" />
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-600 text-[11px] font-bold text-white flex items-center justify-center border-2 border-white shadow-sm z-20">3</div>
              </div>
              <h3 className="text-sm font-bold text-blue-950 mb-1">投标人资格</h3>
              <p className="text-[11px] text-blue-800/70 max-w-[120px] leading-relaxed">设定专业资格与业绩要求</p>
            </div>

            <div className="flex flex-col items-center text-center group relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white border-2 border-blue-200 shadow-lg shadow-blue-500/10 flex items-center justify-center mb-4 relative">
                <Scale className="w-7 h-7 text-blue-600 relative z-10" />
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-600 text-[11px] font-bold text-white flex items-center justify-center border-2 border-white shadow-sm z-20">4</div>
              </div>
              <h3 className="text-sm font-bold text-blue-950 mb-1">评标办法</h3>
              <p className="text-[11px] text-blue-800/70 max-w-[120px] leading-relaxed">配置科学的评分标准</p>
            </div>

            <div className="flex flex-col items-center text-center group relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white border-2 border-blue-200 shadow-lg shadow-blue-500/10 flex items-center justify-center mb-4 relative">
                <FileSignature className="w-7 h-7 text-blue-600 relative z-10" />
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-600 text-[11px] font-bold text-white flex items-center justify-center border-2 border-white shadow-sm z-20">5</div>
              </div>
              <h3 className="text-sm font-bold text-blue-950 mb-1">招标策划</h3>
              <p className="text-[11px] text-blue-800/70 max-w-[120px] leading-relaxed">一键生成完整策划方案</p>
            </div>
          </div>
        </div>
      </div>

      {/* Efficiency Toolbox */}
      <div id="efficiency-toolbox" className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100 shadow-md shadow-blue-500/5 relative scroll-mt-24 overflow-hidden">
        <div className="p-8 border-b border-blue-100 flex items-center justify-between bg-blue-50/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl border border-blue-100 text-blue-600 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-blue-950">
                效率工具箱
              </h2>
              <p className="text-sm text-blue-800/70 mt-0.5">
                集成多项实用工具，辅助您快速完成合规性检查、数据查询与风险评估
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {[
              { name: '合规性自查', icon: CheckCircle2, desc: '检查招标文件合规性', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
              { name: '下载模板库', icon: FileText, desc: '标准招标文件模板', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
              { name: '历史数据查询', icon: Clock, desc: '过往项目数据分析', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
              { name: '专家库检索', icon: Users, desc: '评审专家资源库', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
              { name: '风险评估模型', icon: ShieldAlert, desc: '项目潜在风险预警', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
              { name: '政策法规库', icon: BookOpen, desc: '最新招标采购法规', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
            ].map((tool, i) => (
              <button key={i} className="bg-white hover:bg-blue-50/50 border border-blue-100 hover:border-blue-200 rounded-3xl p-6 text-left transition-all group flex items-center gap-5 shadow-sm hover:shadow-md">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-105", tool.bg, tool.color, tool.border)}>
                  <tool.icon className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div>
                  <span className="text-sm font-bold block text-blue-950 mb-1.5 group-hover:text-blue-700 transition-colors">{tool.name}</span>
                  <span className="text-xs text-blue-800/70 leading-relaxed">{tool.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};


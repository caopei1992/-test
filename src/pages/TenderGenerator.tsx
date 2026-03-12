import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Search, BarChart3, AlertTriangle, Loader2, FileCheck, Layers, ShieldCheck, Download, Clock, Scale, LayoutDashboard, ListTodo, CheckCircle2, XCircle, History } from 'lucide-react';
import { analyzeTenderRequirements, type TenderAnalysisResult } from '@/services/gemini';
import { cn } from '@/lib/utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { toast } from 'sonner';

// --- Components ---

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl shadow-md shadow-blue-500/5 overflow-hidden", className)}>
    {children}
  </div>
);

const SectionHeader = ({ icon: Icon, title, color = "blue" }: { icon: any; title: string, color?: "indigo" | "emerald" | "amber" | "blue" | "purple" }) => {
  const colorMap = {
    indigo: "bg-blue-100 text-blue-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    blue: "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="flex items-center gap-3 mb-5 text-blue-950">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shadow-sm", colorMap[color])}>
        <Icon size={20} className="stroke-[2]" />
      </div>
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
    </div>
  );
};

export const TenderGenerator = () => {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [result, setResult] = useState<TenderAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'details'>('dashboard');

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setIsAnalyzing(true);
    setLoadingStep('正在解析项目需求...');
    
    // Simulate steps for better UX
    setTimeout(() => setLoadingStep('识别核心指标...'), 1500);
    setTimeout(() => setLoadingStep('分析市场对标数据...'), 3000);
    setTimeout(() => setLoadingStep('生成招标文件要素...'), 4500);
    setTimeout(() => setLoadingStep('构建评分模型与时间轴...'), 6000);

    try {
      const data = await analyzeTenderRequirements(input);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("分析失败，请重试。");
    } finally {
      setIsAnalyzing(false);
      setLoadingStep('');
    }
  };

  const handleExport = () => {
    if (!result) return;
    
    const mdContent = `
# 招标策划方案

## 1. 核心指标
- **投资规模**: ${result.coreIndicators.investmentScale}
- **交付周期**: ${result.coreIndicators.deliveryCycle}
- **技术标准**: ${result.coreIndicators.technicalStandards}
- **质量要求**: ${result.coreIndicators.qualityRequirements}

## 2. 市场分析
${result.marketAnalysis}
${result.marketStats ? `
- **竞争程度**: ${result.marketStats.competitiveness}
- **潜在供应商**: ${result.marketStats.estimatedSupplierCount}+
- **资格符合率**: ${result.marketStats.qualificationRate}
` : ''}

## 3. 招标需求清单
| 项目 | 描述 | 数量 | 单位 |
|---|---|---|---|
${result.tenderRequirements.map(item => `| ${item.item} | ${item.description} | ${item.quantity} | ${item.unit} |`).join('\n')}

## 4. 投标人资格准入条件
${result.bidderQualifications.map(q => `- [${q.category}] ${q.requirement}`).join('\n')}

## 5. 技术参数标准
${result.technicalParameters.map(p => `- **${p.parameter}**: ${p.value} ${p.tolerance ? `(±${p.tolerance})` : ''}`).join('\n')}

## 6. 评标办法建议
${result.scoringCriteria?.map(c => `- **${c.criterion}** (${c.weight}): ${c.description}`).join('\n') || ''}

## 7. 项目关键节点
${result.projectTimeline?.map(t => `- **${t.phase}**: ${t.duration} (${t.deliverable})`).join('\n') || ''}

## 8. 产品选型建议
${result.productAdvice ? `
- **推荐规格**: ${result.productAdvice.recommendedSpecs}
- **选项分析**: ${result.productAdvice.optionsAnalysis}
- **最佳选择**: ${result.productAdvice.bestChoice}
` : ''}

## 9. 类似项目参考
${result.referenceProjects?.map(p => `- **${p.projectName}** (相似度: ${p.similarity}): ${p.keyTakeaway}`).join('\n') || ''}

## 10. 风险评估
${result.riskAssessment.map(r => `- **风险**: ${r.risk}\n  **应对**: ${r.mitigation}`).join('\n')}
    `;

    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tender_plan.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("方案已导出", {
      description: "tender_plan.md 已下载到您的设备。"
    });
  };

  const marketChartData = React.useMemo(() => {
    if (!result?.marketStats) return [
      { name: '符合资格', value: 65, color: '#10b981' },
      { name: '有风险', value: 20, color: '#f59e0b' },
      { name: '不合格', value: 15, color: '#ef4444' },
    ];
    
    const qualifiedRate = parseInt(result.marketStats.qualificationRate.replace(/[^0-9]/g, '')) || 0;
    return [
      { name: '符合资格', value: qualifiedRate, color: '#10b981' },
      { name: '其他', value: 100 - qualifiedRate, color: '#cbd5e1' },
    ];
  }, [result]);

  return (
    <div className="space-y-8 p-8 min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Input Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-1 border-blue-200 shadow-lg shadow-blue-500/10">
          <div className="bg-blue-50/50 p-6 border-b border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-3 text-base font-bold text-blue-950">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                <FileText size={20} />
              </div>
              项目采购需求录入
            </div>
          </div>
          <div className="p-8">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="请在此粘贴您的项目采购需求文档内容（例如：'建设一个新的数据中心，包含500个机柜，预算约5000万，工期18个月...'）"
              className="w-full h-48 p-6 bg-white border border-blue-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-blue-950 placeholder:text-blue-300 transition-all font-sans text-sm leading-relaxed shadow-inner"
            />
            <div className="mt-8 flex justify-center items-center">
              <div className="text-xs text-blue-800/60 mr-6">
                {isAnalyzing && (
                  <span className="flex items-center gap-2 text-blue-700 animate-pulse font-bold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {loadingStep}
                  </span>
                )}
              </div>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !input.trim()}
                className="flex items-center gap-3 px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
              >
                {isAnalyzing ? '智能分析中...' : (
                  <>
                    <Search className="w-5 h-5 stroke-[2.5]" />
                    生成策划方案
                  </>
                )}
              </button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Results Section */}
      {result && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Tabs */}
          <div className="flex items-center gap-4 mb-6 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={cn(
                "pb-3 px-1 text-sm font-medium transition-colors relative",
                activeTab === 'dashboard' ? "text-indigo-600" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <div className="flex items-center gap-2">
                <LayoutDashboard size={16} />
                策划概览
              </div>
              {activeTab === 'dashboard' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={cn(
                "pb-3 px-1 text-sm font-medium transition-colors relative",
                activeTab === 'details' ? "text-indigo-600" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <div className="flex items-center gap-2">
                <ListTodo size={16} />
                详细清单
              </div>
              {activeTab === 'details' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
              )}
            </button>
            <div className="ml-auto pb-2">
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Download size={14} />
                导出方案
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Dashboard Tab Content */}
            {activeTab === 'dashboard' && (
              <>
                {/* Add this section */}
                <div className="lg:col-span-12">
                  <Card className="p-5 border border-blue-200 bg-blue-50/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">招标策划方案</h3>
                        <p className="text-xs text-slate-500 mt-1">基于 AI 分析生成的招标策划方案，您可以查看标准模板进行对比。</p>
                      </div>
                      <a 
                        href="/elements" 
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors shadow-sm"
                      >
                        <FileText size={14} />
                        查看标准招标文件模板
                      </a>
                    </div>
                  </Card>
                </div>
                
                {/* Left Column */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Core Indicators */}
                  <Card className="p-5 border-l-4 border-l-blue-500 shadow-md shadow-blue-500/5">
                    <SectionHeader icon={BarChart3} title="核心指标" color="indigo" />
                    <div className="space-y-4">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">投资规模</div>
                        <div className="text-xl font-bold text-slate-900">{result.coreIndicators.investmentScale}</div>
                      </div>
                      
                      <div className="h-px bg-slate-100" />
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">交付周期</div>
                        <div className="text-base font-bold text-slate-900">{result.coreIndicators.deliveryCycle}</div>
                      </div>
                      <div className="h-px bg-slate-100" />
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">质量要求</div>
                        <div className="text-xs text-slate-600 leading-relaxed font-medium">{result.coreIndicators.qualityRequirements}</div>
                      </div>
                    </div>
                  </Card>

                  {/* Market Context */}
                  <Card className="p-5 shadow-md shadow-blue-500/5">
                    <SectionHeader icon={Search} title="市场分析" color="blue" />
                    <p className="text-xs text-slate-600 mb-5 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {result.marketAnalysis}
                    </p>
                    
                    {result.marketStats && (
                      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                        <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                          <div className="text-[10px] text-slate-500 mb-0.5">竞争程度</div>
                          <div className="font-bold text-blue-600 text-sm">{result.marketStats.competitiveness}</div>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                          <div className="text-[10px] text-slate-500 mb-0.5">潜在供应商</div>
                          <div className="font-bold text-blue-600 text-sm">{result.marketStats.estimatedSupplierCount}+</div>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                          <div className="text-[10px] text-slate-500 mb-0.5">资格符合率</div>
                          <div className="font-bold text-blue-600 text-sm">{result.marketStats.qualificationRate}</div>
                        </div>
                      </div>
                    )}

                    <div className="h-40 w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={marketChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={60}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {marketChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Center Text for Pie Chart */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                          <div className="text-[10px] text-slate-400">符合率</div>
                          <div className="text-base font-bold text-slate-700">
                            {result.marketStats ? result.marketStats.qualificationRate : '65%'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center gap-3 text-[10px] text-slate-500 mt-1">
                      {marketChartData.map((entry, idx) => (
                         <div key={idx} className="flex items-center gap-1">
                           <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                           {entry.name}
                         </div>
                      ))}
                    </div>

                    {result.historicalComparison && (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 mb-1.5 text-slate-800">
                          <History size={14} className="text-blue-500" />
                          <h3 className="text-xs font-semibold">历史招标案例匹配</h3>
                        </div>
                        <p className="text-[10px] text-slate-600 leading-relaxed bg-slate-50 p-2 rounded border border-slate-100">
                          {result.historicalComparison}
                        </p>
                      </div>
                    )}
                  </Card>

                  {/* Product Selection Advice (New) */}
                  {result.productAdvice && (
                    <Card className="p-5 shadow-md shadow-blue-500/5">
                      <SectionHeader icon={ListTodo} title="产品选型建议" color="blue" />
                      <div className="space-y-4">
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">推荐规格</div>
                          <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-2 rounded border border-slate-100">
                            {result.productAdvice.recommendedSpecs}
                          </p>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">选项分析</div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {result.productAdvice.optionsAnalysis}
                          </p>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">最佳选择策略</div>
                          <div className="text-xs text-blue-700 font-bold bg-blue-50 p-2 rounded border border-blue-100">
                            {result.productAdvice.bestChoice}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Policy & Compliance Check (New) */}
                  <Card className="p-5 shadow-md shadow-emerald-500/5">
                    <SectionHeader icon={ShieldCheck} title="政策法规与合规性校验" color="emerald" />
                    <div className="space-y-3">
                      {result.policyCheck?.map((check, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                          <div className="mt-0.5">
                            {check.status === 'Pass' && <CheckCircle2 size={16} className="text-emerald-500" />}
                            {check.status === 'Warning' && <AlertTriangle size={16} className="text-amber-500" />}
                            {check.status === 'Fail' && <XCircle size={16} className="text-red-500" />}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-1">
                              {check.rule}
                              <span className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                                check.status === 'Pass' ? "bg-emerald-100 text-emerald-700" :
                                check.status === 'Warning' ? "bg-amber-100 text-amber-700" :
                                "bg-red-100 text-red-700"
                              )}>
                                {check.status === 'Pass' ? '通过' : check.status === 'Warning' ? '预警' : '不合规'}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-relaxed">{check.comment}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Scoring Criteria (New) */}
                  <Card className="p-5 shadow-md shadow-indigo-500/5">
                    <SectionHeader icon={Scale} title="评标办法建议" color="purple" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={result.scoringCriteria?.map(item => ({
                            subject: item.criterion,
                            A: parseInt(item.weight.replace(/[^0-9]/g, '')) || 0,
                            fullMark: 100,
                          })) || []}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                              name="权重"
                              dataKey="A"
                              stroke="#8b5cf6"
                              strokeWidth={3}
                              fill="#8b5cf6"
                              fillOpacity={0.2}
                            />
                            <Tooltip />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-3 flex flex-col justify-center">
                        {result.scoringCriteria?.map((criteria, idx) => (
                          <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between hover:border-indigo-200 transition-colors">
                            <div>
                              <div className="font-bold text-slate-800 text-xs">{criteria.criterion}</div>
                              <div className="text-[10px] text-slate-500 mt-1">{criteria.description}</div>
                            </div>
                            <div className="text-lg font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg min-w-[3rem] text-center">{criteria.weight}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>

                  {/* Timeline (New) */}
                  <Card className="p-5 shadow-md shadow-blue-500/5">
                    <SectionHeader icon={Clock} title="项目关键节点规划" color="blue" />
                    <div className="relative border-l-2 border-blue-100 ml-3 space-y-8 py-2">
                      {result.projectTimeline?.map((phase, idx) => (
                        <div key={idx} className="relative pl-8 group">
                          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-blue-400 group-hover:border-blue-600 group-hover:scale-125 transition-all shadow-sm"></div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                            <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">{phase.phase}</h3>
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full w-fit border border-blue-100">
                              {phase.duration}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">{phase.deliverable}</p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Reference Projects (New) */}
                  {result.referenceProjects && (
                    <Card className="p-5 shadow-md shadow-purple-500/5">
                      <SectionHeader icon={History} title="类似项目参考" color="purple" />
                      <div className="space-y-4">
                        {result.referenceProjects.map((project, idx) => (
                          <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100 hover:border-purple-200 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="text-xs font-bold text-slate-900">{project.projectName}</h3>
                              <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded font-medium">
                                相似度 {project.similarity}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-relaxed">
                              {project.keyTakeaway}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Risk Assessment */}
                  <Card className="p-5 bg-amber-50/30 border-amber-100 shadow-md shadow-amber-500/5">
                    <SectionHeader icon={AlertTriangle} title="风险评估" color="amber" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {result.riskAssessment.map((risk, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className="font-bold text-amber-800 text-xs mb-1 flex items-center gap-2">
                            <AlertTriangle size={12} />
                            {risk.risk}
                          </div>
                          <div className="text-[10px] text-slate-600 leading-relaxed pl-5">{risk.mitigation}</div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </>
            )}

            {/* Details Tab Content */}
            {activeTab === 'details' && (
              <div className="lg:col-span-12 space-y-6">
                {/* Tender Requirements List */}
                <Card className="overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <SectionHeader icon={FileCheck} title="招标需求清单" />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                          <th className="px-4 py-2 whitespace-nowrap">项目/服务</th>
                          <th className="px-4 py-2 whitespace-nowrap">描述</th>
                          <th className="px-4 py-2 w-20 whitespace-nowrap">数量</th>
                          <th className="px-4 py-2 w-20 whitespace-nowrap">单位</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {result.tenderRequirements.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-2 font-medium text-slate-900 whitespace-nowrap">{item.item}</td>
                            <td className="px-4 py-2 text-slate-600 min-w-[300px]">{item.description}</td>
                            <td className="px-4 py-2 text-slate-900 whitespace-nowrap">{item.quantity}</td>
                            <td className="px-4 py-2 text-slate-500 whitespace-nowrap">{item.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Technical Parameters */}
                  <Card>
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                      <SectionHeader icon={Layers} title="技术参数标准" />
                    </div>
                    <div className="space-y-2 p-4">
                      {result.technicalParameters.map((param, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-100">
                          <span className="text-xs font-medium text-slate-700">{param.parameter}</span>
                          <div className="text-right">
                            <div className="text-xs font-bold text-slate-900">{param.value}</div>
                            {param.tolerance && (
                              <div className="text-[10px] text-slate-500">± {param.tolerance}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Bidder Qualifications */}
                  <Card>
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                      <SectionHeader icon={ShieldCheck} title="投标人资格准入条件" />
                    </div>
                    <div className="p-4 space-y-2">
                      {result.bidderQualifications.map((qual, idx) => (
                        <div key={idx} className="flex gap-2 items-start">
                          <div className={cn(
                            "mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider min-w-fit",
                            (qual.category === 'Mandatory' || qual.category === '强制项') ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                          )}>
                            {qual.category}
                          </div>
                          <p className="text-xs text-slate-700">{qual.requirement}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            )}

          </div>
        </motion.div>
      )}
    </div>
  );
};

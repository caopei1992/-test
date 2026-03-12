import React, { useState, useEffect } from 'react';
import { FolderOpen, Plus, Trash2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

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

export const MyProjects = () => {
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
      const savedIds = new Set(savedProjects.map((p: any) => p.id));
      const uniqueInitialProjects = initialProjects.filter(p => !savedIds.has(p.id));
      setProjects([...savedProjects, ...uniqueInitialProjects]);
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100 shadow-md shadow-blue-500/5 overflow-hidden">
        <div className="p-8 border-b border-blue-100 flex items-center justify-between bg-blue-50/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-xl border border-blue-100 text-blue-600 shadow-sm">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-blue-950">
                我的项目
              </h2>
              <p className="text-sm text-blue-800/70 mt-0.5">管理并追踪所有招标策划项目</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/projects/create')}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <Plus size={16} />
            新建项目
          </button>
        </div>

        <div className="h-[450px] flex flex-col">
          <div className="flex-1 overflow-y-auto overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="sticky top-0 bg-blue-50/90 backdrop-blur-sm text-[11px] font-bold text-blue-900 uppercase tracking-wider border-b border-blue-100 z-10">
                  <th className="py-4 pl-8 font-bold">项目名称 / ID</th>
                  <th className="py-4 font-bold">状态</th>
                  <th className="py-4 font-bold">当前进度</th>
                  <th className="py-4 font-bold">预算 / 部门</th>
                  <th className="py-4 font-bold">最后更新</th>
                  <th className="py-4 text-right pr-8 font-bold">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50 text-sm">
                {currentProjects.map((project) => (
                  <tr 
                    key={project.id} 
                    className="group hover:bg-blue-50/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <td className="py-5 pl-8">
                      <div className="font-bold text-blue-950 group-hover:text-blue-700 transition-colors mb-1">{project.name}</div>
                      <div className="text-xs text-blue-800/60 font-mono tracking-tight">{project.id}</div>
                    </td>
                    <td className="py-5">
                      <span className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-bold border",
                        project.status === '进行中' ? "bg-blue-100 text-blue-800 border-blue-200" :
                        project.status === '已完成' ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                        "bg-amber-100 text-amber-800 border-amber-200"
                      )}>
                        {project.status}
                      </span>
                    </td>
                    <td className="py-5 w-1/4 pr-8">
                      <div className="flex items-center gap-4">
                        <div className="flex-1 h-2 bg-blue-100 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              project.status === '已完成' ? "bg-emerald-500" : "bg-blue-600"
                            )}
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-blue-950 w-10 text-right">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="py-5">
                      <div className="font-bold text-blue-950 text-sm mb-1">{project.budget || '待定'}</div>
                      <div className="text-xs text-blue-800/60">{project.department || '未分配'}</div>
                    </td>
                    <td className="py-5 text-blue-800/70 text-xs font-bold">
                      {project.lastUpdate}
                    </td>
                    <td className="py-5 text-right pr-8">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(project.id);
                        }}
                        className="p-2.5 hover:bg-red-50 rounded-xl text-blue-800/40 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-red-100"
                        title="删除项目"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 py-4 border-t border-blue-50 bg-white">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="px-3 py-1 text-xs font-bold text-blue-900 disabled:opacity-50"
              >
                上一页
              </button>
              <span className="text-xs text-blue-800">第 {currentPage} 页 / 共 {totalPages} 页</span>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-3 py-1 text-xs font-bold text-blue-900 disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

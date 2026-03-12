import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowRight, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MyProjectsList = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage, setProjectsPerPage] = useState(10);

  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem('projects') || '[]');
    if (savedProjects.length === 0) {
      const dummyProjects = Array.from({ length: 15 }, (_, i) => ({
        id: `PRJ-DUMMY-${i + 1}`,
        name: `示例项目 ${i + 1}`,
        status: i % 3 === 0 ? '进行中' : i % 3 === 1 ? '策划中' : '已完成',
        progress: Math.floor(Math.random() * 100),
        budget: `￥${(Math.floor(Math.random() * 10) + 1) * 100000}`,
        department: '示例部门',
        lastUpdate: '刚刚'
      }));
      setProjects(dummyProjects);
      localStorage.setItem('projects', JSON.stringify(dummyProjects));
    } else {
      setProjects(savedProjects);
    }
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除该项目吗？此操作不可逆。')) {
      const updatedProjects = projects.filter((p: any) => p.id !== id);
      setProjects(updatedProjects);
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
    }
  };

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(projects.length / projectsPerPage);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900">我的项目</h1>
        <button 
          onClick={() => navigate('/projects/create')}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 text-sm"
        >
          <Plus size={16} />
          新建项目
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <th className="py-4 pl-8">项目名称 / ID</th>
              <th className="py-4 pr-2">状态</th>
              <th className="py-4 pr-2">当前进度</th>
              <th className="py-4">预算 / 部门</th>
              <th className="py-4">最后更新</th>
              <th className="py-4 text-right pr-8">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-sm">
            {currentProjects.map((project: any) => (
              <tr 
                key={project.id} 
                className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <td className="py-5 pl-8">
                  <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors mb-1">{project.name}</div>
                  <div className="text-xs text-slate-500 font-mono">{project.id}</div>
                </td>
                <td className="py-5 pr-2">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold border",
                    project.status === '进行中' ? "bg-blue-50 text-blue-700 border-blue-100" :
                    project.status === '已完成' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                    "bg-amber-50 text-amber-700 border-amber-100"
                  )}>
                    {project.status}
                  </span>
                </td>
                <td className="py-5 pr-2">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-0.5 bg-slate-100 rounded-full overflow-hidden w-10">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${project.progress}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-900">{project.progress}%</span>
                  </div>
                </td>
                <td className="py-5">
                  <div className="font-bold text-slate-900 text-sm">{project.budget || '待定'}</div>
                  <div className="text-xs text-slate-500">{project.department || '未分配'}</div>
                </td>
                <td className="py-5 text-slate-500 text-xs">{project.lastUpdate}</td>
                <td className="py-5 text-right pr-8">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }}
                    className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {projects.length > 0 && (
          <div className="flex justify-between items-center px-8 py-4 border-t border-slate-100 bg-white">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>每页显示:</span>
              <select 
                value={projectsPerPage}
                onChange={(e) => {
                  setProjectsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-slate-200 rounded-lg px-2 py-1 text-slate-900"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg disabled:opacity-50"
              >
                上一页
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "w-6 h-6 rounded-lg text-xs font-bold transition-colors",
                    currentPage === page ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {page}
                </button>
              ))}
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-lg disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Layout } from '@/components/Layout';
import { ProjectManagement } from '@/pages/ProjectManagement';
import { MyProjectsList } from '@/pages/MyProjectsList';
import { TenderGenerator } from '@/pages/TenderGenerator';
import { DecisionSupport } from '@/pages/DecisionSupport';

import { ProjectWorkflow } from '@/pages/ProjectWorkflow';
import { ProjectDetail } from '@/pages/ProjectDetail';

// Placeholder components for routes not yet implemented
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
    <div className="text-4xl font-bold mb-4">🚧</div>
    <h2 className="text-xl font-semibold text-slate-600">{title}</h2>
    <p className="mt-2">该功能模块正在开发中...</p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/projects/create" element={<ProjectWorkflow />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/projects" replace />} />
          <Route path="projects" element={<ProjectManagement />} />
          <Route path="projects/list" element={<MyProjectsList />} />
          <Route path="analysis" element={<TenderGenerator />} />
          <Route path="decision" element={<DecisionSupport />} />
          
          {/* Placeholders for other routes */}
          <Route path="elements" element={<PlaceholderPage title="招标要素生成" />} />
          <Route path="plan" element={<PlaceholderPage title="策划生成与成果" />} />
          <Route path="knowledge" element={<PlaceholderPage title="数据与AI底座" />} />
          <Route path="settings" element={<PlaceholderPage title="系统设置" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

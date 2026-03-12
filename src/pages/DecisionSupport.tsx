import React from 'react';
import { BarChart3, TrendingUp, Users, Scale, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';

const marketData = [
  { month: '1月', price: 4200, avg: 4100 },
  { month: '2月', price: 4300, avg: 4150 },
  { month: '3月', price: 4100, avg: 4200 },
  { month: '4月', price: 4400, avg: 4250 },
  { month: '5月', price: 4600, avg: 4300 },
  { month: '6月', price: 4500, avg: 4350 },
];

const supplierData = [
  { name: '供应商A', score: 85, price: 92 },
  { name: '供应商B', score: 78, price: 88 },
  { name: '供应商C', score: 92, price: 75 },
  { name: '供应商D', score: 65, price: 95 },
  { name: '供应商E', score: 88, price: 82 },
];

export const DecisionSupport = () => {
  return (
    <div className="space-y-8 p-8 min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
          <BarChart3 className="w-6 h-6 text-white stroke-[2]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-blue-950">决策辅助分析</h1>
          <p className="text-blue-800/70 text-sm mt-1">基于历史数据与市场行情的智能决策支持</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Price Trend Analysis */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-blue-100 shadow-md shadow-blue-500/5 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 shadow-sm">
              <TrendingUp size={24} className="stroke-[2]" />
            </div>
            <h2 className="text-lg font-bold text-blue-950">市场价格趋势分析</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={marketData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dbeafe" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#1e40af', fontSize: 12, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#1e40af', fontSize: 12, fontWeight: 600}} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="price" name="本项目预估" stroke="#2563eb" strokeWidth={3} dot={{r: 5, strokeWidth: 2}} />
                <Line type="monotone" dataKey="avg" name="行业均价" stroke="#94a3b8" strokeWidth={3} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 p-5 bg-blue-50/50 rounded-2xl border border-blue-100 text-sm text-blue-900/80 leading-relaxed font-medium">
            <span className="font-bold text-blue-700">AI 分析：</span>
            近期市场价格呈上升趋势，建议在6月前完成采购，预计可节省约 5-8% 的成本。
          </div>
        </div>

        {/* Supplier Analysis */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-blue-100 shadow-md shadow-blue-500/5 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-sm">
              <Users size={24} className="stroke-[2]" />
            </div>
            <h2 className="text-lg font-bold text-blue-950">潜在供应商竞争力分析</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supplierData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dbeafe" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#1e40af', fontSize: 12, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#1e40af', fontSize: 12, fontWeight: 600}} />
                <Tooltip cursor={{fill: '#eff6ff'}} />
                <Legend />
                <Bar dataKey="score" name="技术评分" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="price" name="价格竞争力" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-sm text-emerald-900/80 leading-relaxed font-medium">
            <span className="font-bold text-emerald-700">推荐策略：</span>
            供应商C在技术评分上表现优异，但价格竞争力较低。建议在谈判环节重点关注价格条款。
          </div>
        </div>

        {/* Compliance Check */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-blue-100 shadow-md shadow-blue-500/5 md:col-span-2 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shadow-sm">
              <Scale size={24} className="stroke-[2]" />
            </div>
            <h2 className="text-lg font-bold text-blue-950">合规性预警</h2>
          </div>
          <div className="space-y-4">
            {[
              { type: 'warning', title: '评分标准倾向性风险', desc: '技术参数中"支持私有协议X"可能指向特定厂商，建议修改为通用标准描述。' },
              { type: 'info', title: '资质要求合规', desc: '设置的"一级资质"要求符合项目规模标准，未发现排他性条款。' },
              { type: 'warning', title: '付款条款风险', desc: '预付款比例超过30%，需确认是否符合集团财务管理规定。' },
            ].map((item, i) => (
              <div key={i} className={`p-6 rounded-2xl border flex gap-4 items-start ${
                item.type === 'warning' ? 'bg-amber-50/50 border-amber-100' : 'bg-blue-50/50 border-blue-100'
              }`}>
                <AlertCircle className={`w-6 h-6 mt-0.5 ${
                  item.type === 'warning' ? 'text-amber-600' : 'text-blue-600'
                }`} />
                <div>
                  <h3 className={`font-bold text-sm ${
                    item.type === 'warning' ? 'text-amber-950' : 'text-blue-950'
                  }`}>{item.title}</h3>
                  <p className={`text-sm mt-2 ${
                    item.type === 'warning' ? 'text-amber-800/80' : 'text-blue-800/80'
                  }`}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

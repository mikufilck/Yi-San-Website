import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, getFileUrl } from '../../utils/apiClient'; // 核心：引用统一路径工具
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCamera, FiCheckCircle, FiClock, FiMapPin, FiX, FiExternalLink, FiEye,
  FiAlertCircle, FiMessageSquare, FiSend, FiList, FiActivity, FiCornerDownRight, FiImage, FiChevronDown, FiChevronUp, FiLayers
} from 'react-icons/fi';

const ClientDashboard: React.FC = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [activeTab, setActiveTab] = useState<'timeline' | 'chat'>('timeline');
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [globalFeedback, setGlobalFeedback] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>({});
  
  // 数字工地往期资源抽屉状态
  const [historyDrawer, setHistoryDrawer] = useState<'report' | 'vr' | null>(null);

  // 1. 实时轮询：每 3 秒同步一次最新工地状态
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['clientProject', projectId],
    queryFn: async () => {
      const res: any = await apiClient.get(`/client/project/${projectId}`);
      return res; 
    },
    refetchInterval: 3000, 
  });

  useEffect(() => {
    if (scrollRef.current && activeTab === 'chat') {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [project?.chat_logs, activeTab]);

  const feedbackMutation = useMutation({
    mutationFn: async ({ content, nodeId, isConfirm }: { content: string, nodeId: number, isConfirm: boolean }) => {
      if (isConfirm) {
        return await apiClient.post(`/client/node/${nodeId}/confirm`, { content });
      } else {
        return await apiClient.post(`/client/project/message`, { content });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientProject', projectId] });
      setGlobalFeedback("");
    }
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed': return { bg: 'bg-emerald-500', text: '已完成 ✅', textColor: 'text-emerald-700', icon: <FiCheckCircle /> };
      case 'ongoing': return { bg: 'bg-amber-500', text: '进行中 🚧', textColor: 'text-amber-700', icon: <FiClock className="animate-pulse" /> };
      default: return { bg: 'bg-zinc-200', text: '待处理 ⏳', textColor: 'text-zinc-500', icon: <FiClock /> };
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-[#F9F9F7]"><div className="w-8 h-8 border-2 border-[#8C7355] border-t-transparent rounded-full animate-spin" /></div>;
  if (error || !project) return <div className="min-h-screen flex items-center justify-center bg-[#F9F9F7] px-8 text-center"><FiAlertCircle className="mx-auto text-amber-600 mb-4" size={32} /><button onClick={() => navigate('/client/login')} className="px-8 py-3 bg-zinc-900 text-white text-[10px] uppercase font-black tracking-widest">返回登录</button></div>;

  return (
    <div className="min-h-screen bg-[#F9F9F7] text-zinc-900 pb-40 selection:bg-[#8C7355] selection:text-white">
      
      {/* A. 头部视觉：进度与身份标识 */}
      <header className="bg-white px-6 pt-12 pb-2 border-b border-zinc-100 sticky top-0 z-30 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#8C7355]">Digital Site Live</p>
            <h1 className="text-2xl font-light tracking-tight italic">{project.client_name} · 邸</h1>
          </div>
          <div className="text-right">
            <span className="text-4xl font-light tracking-tighter text-[#8C7355]">
              {project.current_progress || 0}<span className="text-sm ml-0.5">%</span>
            </span>
          </div>
        </div>

        <div className="flex gap-8 mt-4">
          {[
            { id: 'timeline', label: '节点记录', icon: <FiList /> },
            { id: 'chat', label: '即时沟通', icon: <FiMessageSquare /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-3 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id ? 'text-zinc-900' : 'text-zinc-300'}`}
            >
              {tab.icon} {tab.label}
              {activeTab === tab.id && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8C7355]" />}
            </button>
          ))}
        </div>
      </header>

      <main className="px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'timeline' ? (
            <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
              
              {/* B. 数字工地沉浸式卡片 (方案 A) */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* VR 360° 模块 */}
                <div className="bg-zinc-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden group">
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">VR 360° View</h3>
                      <p className="text-lg font-light italic">{project.latest_vr?.title || '全景视野准备中'}</p>
                    </div>
                    <button onClick={() => setHistoryDrawer('vr')} className="text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-[#8C7355]">往期</button>
                  </div>
                  <div className="mt-8 flex items-center justify-between relative z-10">
                    <span className="text-[8px] font-mono text-zinc-500 uppercase">Interactive Panorama</span>
                    {project.latest_vr ? (
                      <a href={project.latest_vr.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[#8C7355] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                        <FiEye /> 开启全景
                      </a>
                    ) : (
                      <span className="text-[10px] text-zinc-600 italic">Awaiting...</span>
                    )}
                  </div>
                  {/* 背景装饰 */}
                  <div className="absolute -bottom-4 -right-4 text-zinc-800 opacity-20 group-hover:scale-110 transition-transform duration-1000"><FiEye size={120} /></div>
                </div>

                {/* Weekly Report 模块 */}
                <div className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm relative overflow-hidden group">
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-[#8C7355] mb-1">Weekly Progress</h3>
                      <p className="text-lg font-bold text-zinc-900">{project.latest_report?.title || '本周报表生成中'}</p>
                    </div>
                    <button onClick={() => setHistoryDrawer('report')} className="text-[9px] font-black uppercase tracking-widest text-zinc-300 hover:text-[#8C7355]">往期</button>
                  </div>
                  <div className="mt-8 flex items-center justify-between relative z-10">
                    <span className="text-[8px] font-mono text-zinc-400 uppercase tracking-widest">Formal Documentation</span>
                    {project.latest_report ? (
                      <a href={project.latest_report.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-zinc-100 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-900 hover:text-white transition-all">
                        <FiExternalLink /> 查看详情
                      </a>
                    ) : (
                      <span className="text-[10px] text-zinc-200 italic">Coming soon</span>
                    )}
                  </div>
                  <div className="absolute -bottom-4 -right-4 text-zinc-50 opacity-50 group-hover:scale-110 transition-transform duration-1000"><FiLayers size={120} /></div>
                </div>
              </section>

              {/* C. 节点与验收历史 (原有功能加固) */}
              <section className="space-y-6">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2"><FiActivity /> 施工节点与验收记录</h2>
                <div className="space-y-6">
                  {project.nodes?.map((node: any) => {
                    const config = getStatusConfig(node.status);
                    const isExpanded = expandedNodes[node.id];
                    const logsToShow = isExpanded ? node.logs : (node.logs || []).slice(-3);

                    return (
                      <div key={node.id} className="relative pl-8 border-l border-zinc-200 py-1">
                        <div className="flex items-center gap-2 mb-4">
                           <div className={`absolute -left-[4.5px] top-2 w-2 h-2 rounded-full border-2 border-[#F9F9F7] ${config.bg}`} />
                           <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${config.bg} text-white shadow-sm`}>{config.text}</span>
                           <span className="text-xs font-black uppercase tracking-widest text-zinc-900">{node.node_name}</span>
                        </div>

                        {node.logs?.length > 0 && (
                          <div className="bg-white border border-zinc-100 p-5 space-y-4 mb-4 rounded-2xl shadow-sm">
                            <div className="space-y-4">
                              {logsToShow.map((log: any) => (
                                <div key={log.id} className="space-y-2 border-b border-zinc-50 last:border-0 pb-3 last:pb-0">
                                  <div className="flex gap-2">
                                    <FiCornerDownRight className="text-zinc-300 shrink-0 mt-1" size={12} />
                                    <p className="text-xs text-zinc-800 leading-relaxed font-medium">{log.content}</p>
                                  </div>
                                  {log.images?.length > 0 && (
                                    <div className="flex gap-2 overflow-x-auto pb-2 pl-5">
                                      {log.images.map((img: string, i: number) => (
                                        <img key={i} src={getFileUrl(img)} onClick={() => setSelectedImg(getFileUrl(img))} className="w-20 h-20 object-cover rounded-xl border border-zinc-50 shadow-sm flex-shrink-0" />
                                      ))}
                                    </div>
                                  )}
                                  <div className="pl-5 text-[8px] uppercase font-black text-zinc-400 flex gap-2 tracking-widest">
                                    <span>{log.operator || 'OneThree Studio'}</span>
                                    <span>{new Date(log.created_at).toLocaleString()}</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {node.logs.length > 3 && (
                              <button onClick={() => setExpandedNodes(prev => ({ ...prev, [node.id]: !prev[node.id] }))} className="w-full pt-4 mt-2 border-t border-zinc-50 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#8C7355] hover:opacity-70 transition-opacity">
                                {isExpanded ? <><FiChevronUp /> 收起历史</> : <><FiChevronDown /> 查看往期全部 {node.logs.length} 条记录</>}
                              </button>
                            )}
                          </div>
                        )}
                        
                        {node.status === 'ongoing' && (
                          <button onClick={() => feedbackMutation.mutate({ content: "业主确认验收通过。", nodeId: node.id, isConfirm: true })} className="text-[9px] bg-zinc-900 text-white px-6 py-3 font-black uppercase tracking-widest rounded-xl shadow-lg active:scale-95 transition-transform">
                            签署确认验收
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 项目影像库 */}
              <section className="space-y-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2"><FiCamera /> 现场全景留影库</h2>
                <div className="grid grid-cols-2 gap-3">
                  {project.medias?.map((m: any) => (
                    <div key={m.id} onClick={() => setSelectedImg(getFileUrl(m.url))} className="aspect-square bg-white rounded-2xl overflow-hidden border border-zinc-100 cursor-pointer shadow-sm active:scale-95 transition-transform">
                      <img src={getFileUrl(m.url)} className="w-full h-full object-cover" alt="site" />
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="h-[calc(100vh-380px)] overflow-y-auto pr-2 space-y-6 scroll-smooth" ref={scrollRef}>
                {project.chat_logs?.length > 0 ? (
                  project.chat_logs.map((log: any) => {
                    const isClient = log.sender_type === 'client';
                    return (
                      <div key={log.id} className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] p-4 shadow-sm ${isClient ? 'bg-[#8C7355] text-white rounded-l-2xl rounded-tr-2xl' : 'bg-white text-zinc-800 rounded-r-2xl rounded-tl-2xl border border-zinc-100'}`}>
                          <p className="text-xs leading-relaxed font-medium">{log.content}</p>
                          <div className={`mt-2 flex justify-between items-center opacity-60 text-[7px] uppercase font-black tracking-widest ${isClient ? 'text-zinc-100' : 'text-zinc-500'}`}>
                            <span>{isClient ? 'Owner' : (log.operator || 'OneThree')}</span>
                            <span>{new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-300 space-y-2 pt-20">
                    <FiMessageSquare size={24} />
                    <p className="text-[10px] font-black uppercase tracking-widest">开启实时对话</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* D. 往期记录追溯抽屉 (方案 A 扩展) */}
      <AnimatePresence>
        {historyDrawer && (
          <div className="fixed inset-0 z-[100]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setHistoryDrawer(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="absolute right-0 top-0 bottom-0 w-[85%] bg-white shadow-2xl p-8 flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-light italic uppercase tracking-tighter">History {historyDrawer === 'vr' ? 'Panorama' : 'Reports'}</h3>
                <button onClick={() => setHistoryDrawer(null)} className="p-2 bg-zinc-50 rounded-full"><FiX /></button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4">
                {project.resources?.filter((r: any) => r.resource_type === historyDrawer).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((res: any) => (
                  <a key={res.id} href={res.url} target="_blank" rel="noreferrer" className="block p-5 bg-zinc-50 rounded-2xl group hover:bg-zinc-900 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-black text-zinc-900 group-hover:text-white transition-colors">{res.title}</p>
                        <p className="text-[8px] font-mono text-zinc-400 mt-1 uppercase tracking-widest group-hover:text-zinc-500">{new Date(res.created_at).toLocaleDateString()}</p>
                      </div>
                      <FiExternalLink className="text-zinc-300 group-hover:text-[#8C7355]" />
                    </div>
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 底部输入框 */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-zinc-100 px-6 py-6 z-40 pb-10">
        <div className="flex items-center gap-3">
          <input 
            type="text" 
            placeholder={activeTab === 'chat' ? "键入反馈或疑问..." : "请切换至沟通页聊天"} 
            value={globalFeedback}
            onChange={(e) => setGlobalFeedback(e.target.value)}
            disabled={activeTab !== 'chat'}
            onKeyDown={(e) => e.key === 'Enter' && globalFeedback && feedbackMutation.mutate({ content: globalFeedback, nodeId: 0, isConfirm: false })}
            className="flex-1 bg-zinc-100 border-none rounded-2xl px-5 py-4 text-xs outline-none focus:ring-1 focus:ring-[#8C7355]/30"
          />
          <button 
            disabled={!globalFeedback || feedbackMutation.isPending || activeTab !== 'chat'}
            onClick={() => feedbackMutation.mutate({ content: globalFeedback, nodeId: 0, isConfirm: false })}
            className="w-12 h-12 bg-zinc-900 text-white flex items-center justify-center rounded-2xl shadow-xl active:scale-90 transition-all hover:bg-[#8C7355]"
          >
            <FiSend size={18} />
          </button>
        </div>
      </footer>

      {/* 预览大图 */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setSelectedImg(null)}>
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} src={selectedImg} className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-sm" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientDashboard;
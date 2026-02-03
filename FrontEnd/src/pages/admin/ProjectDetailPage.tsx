import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient, getFileUrl } from '../../utils/apiClient'; 
import { 
  FiArrowLeft, FiSave, FiPlus, FiCamera, FiMessageSquare, FiExternalLink,
  FiCheckCircle, FiClock, FiSend, FiTrash2, FiLoader, FiImage, FiInfo, FiX, FiChevronDown, FiChevronUp, FiLayers, FiEye 
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  
  // 数字工地资源相关状态
  const [resourceModal, setResourceModal] = useState(false);
  const [historyType, setHistoryType] = useState<'report' | 'vr' | null>(null);
  const [resFormData, setResFormData] = useState({ type: 'report', title: '', url: '' });

  // 节点管理状态
  const [nodeDrafts, setNodeDrafts] = useState<Record<number, { text: string, images: string[] }>>({});
  const [expandedNodes, setExpandedNodes] = useState<Record<number, boolean>>({});
  
  const [generalLog, setGeneralLog] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. 数据获取逻辑
  const fetchProject = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const data: any = await apiClient.get(`/admin/projects/${id}`);
      setProject(data);
      
      if (!isSilent) {
        const drafts: Record<number, any> = {};
        data.nodes?.forEach((node: any) => {
          drafts[node.id] = { text: "", images: [] };
        });
        setNodeDrafts(drafts);
      }
    } catch (err) {
      if (!isSilent) navigate('/admin/projects');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    const timer = setInterval(() => fetchProject(true), 5000);
    return () => clearInterval(timer);
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [project?.logs]);

  // 2. 资源发布逻辑
  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post(`/admin/projects/${id}/resources`, {
        resource_type: resFormData.type,
        title: resFormData.title,
        url: resFormData.url
      });
      toast.success('数字工地资源发布成功');
      setResourceModal(false);
      setResFormData({ type: 'report', title: '', url: '' });
      fetchProject(true);
    } catch (err) { toast.error('发布失败，请检查链接格式'); }
  };

  const handleDeleteResource = async (resId: number) => {
    if (!window.confirm('确定要删除此资源链接吗？此操作将使业主端同步失效。')) return;
    try {
      await apiClient.delete(`/admin/projects/resources/${resId}`);
      toast.success('资源已移除');
      fetchProject(true);
    } catch (err) { toast.error('操作失败'); }
  };

  // 3. 原有业务逻辑保持不变
  const handleNodeDraftChange = (nodeId: number, text: string) => {
    setNodeDrafts(prev => ({ ...prev, [nodeId]: { ...prev[nodeId], text } }));
  };

  const handleNodeImageUpload = async (nodeId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'inspection');
    try {
      toast.loading('上传中...', { id: 'upload' });
      const res: any = await apiClient.post(`/admin/projects/${id}/photos`, formData);
      setNodeDrafts(prev => ({
        ...prev,
        [nodeId]: { ...prev[nodeId], images: [...prev[nodeId].images, res.url] }
      }));
      toast.success('上传成功', { id: 'upload' });
    } catch (err) { toast.error('图片上传失败'); }
  };

  const submitNodeLog = async (nodeId: number) => {
    const draft = nodeDrafts[nodeId];
    if (!draft.text.trim() && draft.images.length === 0) return;
    try {
      await apiClient.post(`/admin/projects/${id}/nodes/${nodeId}/logs`, {
        content: draft.text,
        images: draft.images
      });
      toast.success('发布成功');
      setNodeDrafts(prev => ({ ...prev, [nodeId]: { text: "", images: [] } }));
      fetchProject(true);
    } catch (err) { toast.error('发布失败'); }
  };

  const toggleNodeStatus = (nodeId: number) => {
    const updatedNodes = project.nodes.map((n: any) => {
      if (n.id === nodeId) {
        const nextStatus = n.status === 'completed' ? 'pending' : n.status === 'ongoing' ? 'completed' : 'ongoing';
        return { ...n, status: nextStatus };
      }
      return n;
    });
    setProject({ ...project, nodes: updatedNodes });
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const completedNodes = project.nodes.filter((n: any) => n.status === 'completed');
      const maxProgress = completedNodes.length === 0 ? 0 : Math.max(...completedNodes.map((n: any) => n.target_percent));
      
      await apiClient.post(`/admin/projects/${id}/sync`, {
        nodes: project.nodes,
        current_progress: maxProgress,
      });
      toast.success('同步成功！');
      fetchProject(true);
    } catch (err) { toast.error('同步失败'); } finally { setSyncing(false); }
  };

  const submitGeneralLog = async () => {
    if (!generalLog.trim()) return;
    try {
      await apiClient.post(`/admin/projects/${id}/reply`, { content: generalLog });
      setGeneralLog("");
      fetchProject(true);
    } catch (err) { toast.error('发送失败'); }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return { color: 'bg-emerald-500', text: '已完成 ✅', textColor: 'text-emerald-600', icon: <FiCheckCircle /> };
      case 'ongoing': return { color: 'bg-amber-500', text: '进行中 🚧', textColor: 'text-amber-600', icon: <FiClock className="animate-pulse" /> };
      default: return { color: 'bg-zinc-200', text: '待处理 ⏳', textColor: 'text-zinc-400', icon: <FiClock /> };
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-zinc-300 font-black tracking-widest uppercase">Initializing Command Center...</div>;

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-10 pb-40 selection:bg-[#8C7355] selection:text-white">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-4">
          <button onClick={() => navigate('/admin/projects')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black">
            <FiArrowLeft /> Return to Projects
          </button>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-zinc-900 text-white rounded-[2rem] flex items-center justify-center shadow-2xl relative">
              <span className="text-3xl font-light">{project.current_progress}</span>
              <span className="text-[10px] absolute bottom-4 right-4 opacity-50">%</span>
            </div>
            <div>
              <h1 className="text-4xl font-light tracking-tighter text-zinc-900 italic uppercase">{project.client_name} · 邸</h1>
              <div className="flex items-center gap-4 mt-2 text-[10px] font-black uppercase tracking-widest">
                <span className="text-[#8C7355] bg-[#8C7355]/5 px-3 py-1 rounded-full border border-[#8C7355]/10">ID: {project.project_no}</span>
                <span className="text-zinc-400">Access Key: <span className="text-zinc-900 select-all font-mono">{project.access_code}</span></span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => setResourceModal(true)}
            className="bg-white border border-zinc-200 text-zinc-900 px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-50 transition-all shadow-sm flex items-center gap-2"
          >
            <FiLayers /> 发布周报/VR
          </button>
          <button 
            onClick={handleSync}
            disabled={syncing}
            className="bg-zinc-900 text-white px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#8C7355] transition-all shadow-2xl disabled:opacity-30 flex items-center gap-2"
          >
            {syncing ? <FiLoader className="animate-spin" /> : <FiSave />} 同步进度
          </button>
        </div>
      </div>

      {/* A. 数字工地沉浸式展示区 (方案 A) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { type: 'report', label: '最新施工周报', icon: <FiLayers />, data: project.latest_report },
          { type: 'vr', label: 'VR 360° 全景图', icon: <FiEye />, data: project.latest_vr }
        ].map(item => (
          <div key={item.type} className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm relative overflow-hidden group">
             <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-zinc-50 rounded-2xl text-[#8C7355]">{item.icon}</div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">{item.label}</h3>
                    <p className="text-sm font-bold text-zinc-900 mt-1">{item.data?.title || '暂未发布'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setHistoryType(item.type as any)}
                  className="text-[9px] font-black uppercase tracking-widest text-zinc-300 hover:text-[#8C7355] transition-colors"
                >
                  管理往期记录
                </button>
             </div>
             {item.data ? (
               <a href={item.data.url} target="_blank" rel="noreferrer" className="w-full py-4 bg-zinc-900 text-white rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-[#8C7355] transition-all">
                 <FiExternalLink /> 立即预览资产
               </a>
             ) : (
               <div className="w-full py-4 bg-zinc-50 text-zinc-300 rounded-2xl flex items-center justify-center text-[10px] font-black uppercase italic tracking-widest">
                 Awaiting Update...
               </div>
             )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Checkpoints Section */}
          <section className="bg-white rounded-[2.5rem] p-10 border border-zinc-100 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-center mb-10 border-b border-zinc-50 pb-6">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">验收环节管理 / Checkpoints</h2>
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-600 rounded-full text-white shadow-lg animate-bounce">
                <FiInfo size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">点击左侧图标切换施工进度状态</span>
              </div>
            </div>
            
            <div className="space-y-12">
              {project.nodes?.map((node: any) => {
                const draft = nodeDrafts[node.id] || { text: "", images: [] };
                const label = getStatusLabel(node.status);
                const isExpanded = expandedNodes[node.id];

                return (
                  <div key={node.id} className="relative pl-20">
                    <div className="absolute left-[24px] top-12 bottom-[-48px] w-px bg-zinc-100 last:hidden" />
                    <div className="absolute left-0 top-0 flex flex-col items-center gap-2">
                       <button onClick={() => toggleNodeStatus(node.id)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all z-10 border-4 border-white shadow-md ${label.color} text-white hover:scale-110`}>
                        {label.icon}
                      </button>
                      <span className={`text-[10px] font-black uppercase tracking-tighter ${label.textColor}`}>{label.text}</span>
                    </div>

                    <div className="space-y-4">
                      <h4 className={`text-lg font-black uppercase tracking-widest ${node.status === 'pending' ? 'text-zinc-200' : 'text-zinc-900'}`}>
                        {node.node_name}
                        <span className="ml-4 text-[10px] text-zinc-300 font-bold">Target: {node.target_percent}%</span>
                      </h4>

                      {node.logs?.length > 0 && (
                        <div className="space-y-3">
                          <div className={`bg-zinc-50 border border-zinc-100 p-5 rounded-[1.5rem] transition-all ${isExpanded ? 'bg-white shadow-inner' : ''}`}>
                            <p className="text-xs text-zinc-600 italic">{!isExpanded ? `最新记录: ${node.logs[node.logs.length - 1].content}` : "执行全记录:"}</p>
                            {isExpanded && (
                              <div className="mt-4 space-y-4 border-t border-zinc-100 pt-4">
                                {node.logs.map((log: any, idx: number) => (
                                  <div key={log.id} className="border-b border-zinc-50 pb-4 last:border-0">
                                    <div className="flex justify-between mb-2">
                                      <span className="text-[8px] font-black text-zinc-300 uppercase">LOG #{idx + 1}</span>
                                      <span className="text-[8px] font-mono text-zinc-400">{new Date(log.created_at).toLocaleString()}</span>
                                    </div>
                                    <p className="text-xs text-zinc-700">{log.content}</p>
                                    {log.images?.length > 0 && (
                                      <div className="flex gap-2 mt-3">
                                        {log.images.map((img: string, i: number) => (<img key={i} src={getFileUrl(img)} className="w-14 h-14 object-cover rounded-xl border" />))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <button onClick={() => setExpandedNodes(prev => ({ ...prev, [node.id]: !prev[node.id] }))} className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[#8C7355] hover:underline">
                            {isExpanded ? <><FiChevronUp /> 收起历史</> : <><FiChevronDown /> 查看全部 {node.logs.length} 条记录</>}
                          </button>
                        </div>
                      )}

                      <div className="space-y-3 bg-zinc-50/30 border border-dashed border-zinc-200 p-5 rounded-[2rem] focus-within:border-zinc-900 transition-colors">
                        <textarea placeholder="键入节点验收详情..." className="w-full bg-transparent border-none text-xs focus:ring-0 outline-none resize-none min-h-[60px] text-zinc-800" value={draft.text} onChange={(e) => handleNodeDraftChange(node.id, e.target.value)} />
                        { (draft.text || draft.images.length > 0) && (
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-100">
                            {draft.images.map((img, idx) => (
                              <div key={idx} className="relative w-12 h-12">
                                <img src={getFileUrl(img)} className="w-full h-full object-cover rounded-lg" alt="preview" />
                                <button onClick={() => setNodeDrafts(prev => ({ ...prev, [node.id]: { ...prev[node.id], images: prev[node.id].images.filter((_, i) => i !== idx) } }))} className="absolute -top-1 -right-1 bg-white text-red-500 rounded-full shadow-md"><FiX size={10} /></button>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-2">
                          <label className="cursor-pointer p-2 hover:bg-white rounded-xl transition-all"><FiImage className="text-zinc-400" size={18} /><input type="file" className="hidden" onChange={(e) => handleNodeImageUpload(node.id, e)} /></label>
                          <button onClick={() => submitNodeLog(node.id)} className="bg-zinc-900 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#8C7355] transition-all flex items-center gap-2"><FiSend /> 发布本节日志</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Live Diary Sidebar */}
        <div className="space-y-10">
          <section className="bg-zinc-950 rounded-[2.5rem] p-8 h-[800px] flex flex-col shadow-2xl relative overflow-hidden">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-8 flex items-center gap-3 relative z-10">
              沟通日记 / LIVE DIARY
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-auto" />
            </h2>
            
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-6 scrollbar-hide relative z-10" ref={scrollRef}>
              {project.logs?.filter((l: any) => !l.node_id).map((log: any) => (
                <div key={log.id} className={`flex flex-col ${log.sender_type === 'admin' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[90%] p-4 rounded-2xl text-[11px] leading-relaxed shadow-lg ${log.sender_type === 'admin' ? 'bg-[#8C7355] text-white' : 'bg-zinc-800 text-zinc-300'}`}>
                    {log.content}
                    <div className="mt-3 flex justify-between items-center opacity-40 text-[7px] uppercase font-black tracking-widest">
                      <span>{log.operator || 'Studio'}</span>
                      <span>{new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative mt-auto z-10">
              <input type="text" placeholder="发送即时消息..." value={generalLog} onChange={(e) => setGeneralLog(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitGeneralLog()} className="w-full bg-zinc-900 border-none rounded-2xl px-6 py-4 text-xs text-white shadow-xl focus:ring-1 focus:ring-[#8C7355] outline-none pr-14 placeholder-zinc-700" />
              <button onClick={submitGeneralLog} className="absolute right-2 top-2 w-10 h-10 bg-[#8C7355] text-white rounded-xl flex items-center justify-center hover:bg-white hover:text-black transition-all"><FiSend /></button>
            </div>
          </section>
        </div>
      </div>

      {/* 4. 发布资源 Modal */}
      <AnimatePresence>
        {resourceModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/40 backdrop-blur-md p-4">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black italic uppercase">Publish New Asset</h2>
                <button onClick={() => setResourceModal(false)} className="text-zinc-300 hover:text-black"><FiX size={24}/></button>
              </div>
              <form onSubmit={handleAddResource} className="space-y-6">
                <div className="flex bg-zinc-100 p-1.5 rounded-2xl">
                  {['report', 'vr'].map(t => (
                    <button key={t} type="button" onClick={() => setResFormData({...resFormData, type: t})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${resFormData.type === t ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-400'}`}>
                      {t === 'report' ? '施工周报' : 'VR 360°'}
                    </button>
                  ))}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">链接指纹 (标题)</label>
                  <input required placeholder="例：2026年1月第4周施工周报" className="w-full bg-zinc-50 border-none rounded-2xl px-6 py-4 text-sm" value={resFormData.title} onChange={e => setResFormData({...resFormData, title: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-2">资源跳转链接 (URL)</label>
                  <input required placeholder="https://..." className="w-full bg-zinc-50 border-none rounded-2xl px-6 py-4 text-sm" value={resFormData.url} onChange={e => setResFormData({...resFormData, url: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-[#8C7355] text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-zinc-900 transition-all shadow-xl">发布至项目中枢</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. 往期记录管理 Modal */}
      <AnimatePresence>
        {historyType && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/40 backdrop-blur-md p-4">
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white rounded-[2.5rem] w-full max-w-2xl p-10 shadow-2xl max-h-[80vh] flex flex-col">
               <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-black italic uppercase">Past {historyType === 'report' ? 'Reports' : 'VR Views'}</h2>
                  <button onClick={() => setHistoryType(null)} className="text-zinc-300 hover:text-black"><FiX size={24}/></button>
               </div>
               <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                 {project.resources?.filter((r: any) => r.resource_type === historyType).length > 0 ? (
                   project.resources.filter((r: any) => r.resource_type === historyType).map((res: any) => (
                     <div key={res.id} className="bg-zinc-50 p-6 rounded-2xl flex justify-between items-center group">
                        <div>
                          <p className="text-xs font-bold text-zinc-900">{res.title}</p>
                          <p className="text-[9px] font-mono text-zinc-400 mt-1 uppercase">{new Date(res.created_at).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <a href={res.url} target="_blank" rel="noreferrer" className="p-3 bg-white text-zinc-400 hover:text-black rounded-xl shadow-sm border border-zinc-100 transition-all"><FiExternalLink /></a>
                          <button onClick={() => handleDeleteResource(res.id)} className="p-3 bg-white text-zinc-400 hover:text-red-500 rounded-xl shadow-sm border border-zinc-100 transition-all"><FiTrash2 /></button>
                        </div>
                     </div>
                   ))
                 ) : (
                   <div className="py-20 text-center text-zinc-300 text-[10px] font-black uppercase tracking-widest">No history recorded</div>
                 )}
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectDetailPage;
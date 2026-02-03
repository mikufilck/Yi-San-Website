import React from 'react';
import { Outlet, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { 
  FiGrid, 
  FiPlusSquare, 
  FiBriefcase, 
  FiUser, 
  FiLogOut, 
  FiDatabase, 
  FiExternalLink,
  FiFolder,
  FiUsers,
  FiLoader
} from 'react-icons/fi';
// --- 关键修复：引入 apiClient 处理带 Token 的请求 ---
import { apiClient } from '../../utils/apiClient';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('auth_token');
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  
  // --- 动态获取当前用户信息 ---
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // 基础登录保护
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // --- 3. 核心改进：务实的异步登出逻辑 ---
  const handleLogout = async () => {
    if (!window.confirm('确定要安全退出系统吗？')) return;
    
    setIsLoggingOut(true);
    try {
      // 1. 调用后端登出接口（在 users.py 或 auth.py 中应有对应逻辑）
      // 这将使数据库中的 is_online 变为 False
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.warn("后端登出状态同步失败，正在强制清理本地凭证...");
    } finally {
      // 2. 无论后端接口是否成功，都必须清理本地存储并重定向
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      sessionStorage.clear(); 
      setIsLoggingOut(false);
      // 3. 使用 window.location 强制刷新页面状态，彻底清理内存中残留的 Auth 信息
      window.location.href = '/login';
    }
  };

  // --- 4. 动态导航配置：根据权限过滤 ---
  const rawNavItems = [
    { label: '控制台 Dashboard', path: '/admin/dashboard', icon: <FiGrid /> },
    { 
      label: '客户项目 Projects', 
      path: '/admin/projects', 
      icon: <FiFolder />, 
      match: '/admin/projects' 
    },
    { 
      label: '案例管理 Cases', 
      path: '/admin/cases', 
      icon: <FiBriefcase />,
      match: '/admin/cases' 
    },
    { label: '发布案例 New Case', path: '/admin/cases/new', icon: <FiPlusSquare /> },
    { label: '产品工艺 Product', path: '/admin/products', icon: <FiDatabase />, match: '/admin/products' },
    
    // 所有人都有的：个人设置
    { label: '个人设置 Profile', path: '/admin/profile', icon: <FiUser /> },
    
    // 仅超级管理员可见：账号管理
    { 
      label: '管理员管理 Users', 
      path: '/admin/users', 
      icon: <FiUsers />, 
      requireSuper: true 
    },
  ];

  // 过滤掉普通管理员无权看到的菜单项
  const navItems = rawNavItems.filter(item => {
    if (item.requireSuper && user?.role !== 'super_admin') return false;
    return true;
  });

  return (
    <div className="flex h-screen bg-zinc-100 overflow-hidden selection:bg-[#8C7355] selection:text-white">
      {/* --- 左侧固定侧边栏 --- */}
      <aside className="w-64 bg-zinc-950 text-white flex flex-col z-50 shadow-[4px_0_24px_rgba(0,0,0,0.3)]">
        {/* Logo 区 */}
        <div className="p-8 border-b border-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#8C7355] rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-[#8C7355]/20">Y</div>
            <div className="text-xl font-light tracking-tighter">
              YISAN <span className="text-[#8C7355] font-bold">CMS</span>
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2 tracking-[0.2em] uppercase font-black">Management System</p>
        </div>
        
        {/* 导航区 */}
        <nav className="flex-1 p-4 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = item.match 
              ? location.pathname.startsWith(item.match) 
              : location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center justify-between group p-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#8C7355] text-white shadow-lg shadow-[#8C7355]/20' 
                    : 'text-zinc-500 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`text-lg transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  <span className="text-sm font-medium tracking-wide">{item.label}</span>
                </div>
                {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_#fff]"></div>}
              </Link>
            );
          })}

          <div className="pt-8 px-3">
            <div className="h-px bg-white/5 w-full mb-6"></div>
            <a 
              href="/" 
              target="_blank" 
              className="flex items-center space-x-3 p-3 text-zinc-500 hover:text-white text-sm transition-colors group"
              rel="noreferrer"
            >
              <FiExternalLink className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              <span>预览前台网站</span>
            </a>
          </div>
        </nav>

        {/* 底部退出 */}
        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full p-4 bg-zinc-900 hover:bg-red-950/40 text-zinc-500 hover:text-red-400 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 text-sm font-bold border border-white/5 disabled:opacity-50"
          >
            {isLoggingOut ? <FiLoader className="animate-spin" /> : <FiLogOut className="text-lg" />}
            <span>{isLoggingOut ? '正在同步状态...' : '退出登录系统'}</span>
          </button>
        </div>
      </aside>

      {/* --- 右侧主体区 --- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 后台全局顶部栏 */}
        <header className="h-20 bg-white border-b border-zinc-200 px-10 flex justify-between items-center flex-shrink-0 relative z-40 shadow-sm">
          <div className="flex flex-col">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8C7355] mb-1">Status / 系统状态</h2>
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-black text-zinc-600 uppercase tracking-widest">
                {user?.role === 'super_admin' ? 'Super Administrator' : 'Project Manager'} Online
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
              <div className="h-8 w-[1px] bg-zinc-200"></div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-black text-zinc-900 uppercase tracking-tight">
                    {user?.full_name || user?.username || 'Guest'}
                  </p>
                  <p className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">Node: CN-XM-01</p>
                </div>
                <div className="w-11 h-11 bg-zinc-900 rounded-2xl flex items-center justify-center text-[#8C7355] text-lg font-light shadow-inner border border-white/5">
                  {(user?.full_name || user?.username || 'A').charAt(0).toUpperCase()}
                </div>
              </div>
          </div>
        </header>
        
        {/* 内容滚动区 */}
        <main className="flex-1 overflow-y-auto bg-[#F8F9FA] custom-scrollbar">
          <div className="p-10 min-h-full">
            <Outlet context={{ user }} /> 
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
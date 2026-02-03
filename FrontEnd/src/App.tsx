import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
// --- 关键修改：统一使用封装的客户端 ---
import { apiClient } from './utils/apiClient'; 

// --- 导入前台页面 ---
import HomePage from './pages/HomePage';
import CategoriesPage from './pages/CategoriesPage';
import CategoryPage from './pages/CategoryPage';
import CaseDetailPage from './pages/CaseDetailPage';
import ContactPage from './pages/ContactPage';
import AboutPage from './pages/AboutPage';
import AppointmentPage from './pages/AppointmentPage';
import ProductPage from './pages/ProductPage';
import ProductDetailView from './pages/ProductDetailView';
import DesignerDetailPage from './pages/DesignerDetailPage';
import SupportPage from './pages/SupportPage';
import ClientLoginPage from './pages/client/ClientLoginPage';
import ClientDashboard from './pages/client/ClientDashboard';

// --- 导入后台页面 ---
import { DashboardPage } from './pages/admin/DashboardPage';
import { LoginPage } from './pages/admin/LoginPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { CaseListPage } from './pages/admin/CaseListPage';
import { CaseFormPage } from './pages/admin/CaseFormPage';
import { ProductListPage } from "./pages/admin/ProductListPage";
import { UserPage } from './pages/admin/UserPage';
import { ProjectManagerPage } from './pages/admin/ProjectManagerPage'
import { ProjectDetailPage } from './pages/admin/ProjectDetailPage';
import { AdminManagement } from './pages/admin/AdminManagement';

// --- 导入公共组件 ---
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// --- 1. 强力滚动复位组件 ---
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const resetScroll = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const scrollableContainers = document.querySelectorAll('.overflow-y-auto, main, #root, .App');
      scrollableContainers.forEach((el) => { (el as HTMLElement).scrollTop = 0; });
    };
    const timer = setTimeout(resetScroll, 50);
    return () => clearTimeout(timer);
  }, [pathname]);
  return null;
};

// --- 2. 增强版路由守卫 ---
const ProtectedRoute = ({ children, requireSuper = false }: { children: React.ReactNode, requireSuper?: boolean }) => {
  const token = localStorage.getItem('auth_token');
  
  // 检查 Token 格式是否合法（简单校验）
  if (!token || token === 'undefined' || token === 'null') {
    return <Navigate to="/login" replace />;
  }
  
  const userStr = localStorage.getItem('user'); 
  const user = userStr ? JSON.parse(userStr) : null;

  if (requireSuper && user?.role !== 'super_admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// --- 3. 心跳检测 Hook ---
const useHeartbeat = () => {
  const location = useLocation();
  // 务实：心跳应该只在管理端路由下才启动，前台页面没必要刷这个接口
  const isAdminPath = location.pathname.startsWith('/admin');

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    
    // 如果不在后台，或者根本没 token，直接不执行
    if (!isAdminPath || !token) return;

    const pulse = async () => {
      try {
        await apiClient.get('/auth/me');
      } catch (err: any) {
        // 只有 401 才清理
        if (err.response?.status === 401) {
          console.warn("Session Expired - Clearing local storage");
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          // 这里不要写 window.location.href，交给 ProtectedRoute 去决定重定向
        }
      }
    };

    pulse(); 
    const timer = setInterval(pulse, 60000);
    return () => clearInterval(timer);
  }, [isAdminPath, location.pathname]); // 仅在后台路径变化时重置
};

// --- 4. 页面动画包装 ---
const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

// --- 5. 前台通用布局包装 ---
const PublicLayout = ({ 
  children, 
  showHeader = true, 
  showFooter = true,
  headerVariant = 'solid' as 'transparent' | 'solid',
  forceDark = false
}: { 
  children: React.ReactNode, 
  showHeader?: boolean, 
  showFooter?: boolean,
  headerVariant?: 'transparent' | 'solid',
  forceDark?: boolean
}) => (
  <div className="flex flex-col min-h-screen">
    {showHeader && <Header variant={headerVariant} forceDark={forceDark} />}
    <main className="flex-grow">
      <PageTransition>{children}</PageTransition>
    </main>
    {showFooter && <Footer />}
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  useHeartbeat(); 

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* --- 前台路由 --- */}
        <Route path="/" element={<PublicLayout headerVariant="transparent"><HomePage /></PublicLayout>} />
        <Route path="/cases" element={<PublicLayout><CategoriesPage /></PublicLayout>} />
        <Route path="/cases/:categorySlug" element={<PublicLayout><CategoryPage /></PublicLayout>} />
        <Route path="/cases/:categorySlug/:caseSlug" element={<PublicLayout><CaseDetailPage /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
        <Route path="/appointment" element={<PublicLayout><AppointmentPage /></PublicLayout>} />
        <Route path="/support" element={<PublicLayout><SupportPage /></PublicLayout>} />
        
        <Route path="/client/login" element={<ClientLoginPage />} />
        <Route path="/client/dashboard/:projectId" element={<ClientDashboard />} />

        <Route path="/about/teamshow/:id" element={<PublicLayout showHeader={false}><DesignerDetailPage /></PublicLayout>} />

        <Route path="/product" element={<PublicLayout headerVariant="transparent"><ProductPage /></PublicLayout>} />
        <Route path="/product/:category" element={<PublicLayout showHeader={false}><ProductDetailView /></PublicLayout>} />

        {/* 管理后台登录入口：如果已登录直接跳 Dashboard */}
        <Route path="/login" element={
          localStorage.getItem('auth_token') ? 
          <Navigate to="/admin/dashboard" replace /> : 
          <PageTransition><LoginPage /></PageTransition>
        } />
        
        {/* 管理后台受保护路由 */}
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="cases" element={<CaseListPage />} />
          <Route path="cases/new" element={<CaseFormPage />} />
          <Route path="cases/edit/:id" element={<CaseFormPage />} />
          <Route path="products" element={<ProductListPage />} />
          
          {/* 所有人（只要能进后台）都能访问：修改自己的资料 */}
          <Route path="profile" element={<UserPage />} /> 

          {/* 仅限超管访问：管理所有人的账号 */}
          <Route path="users" element={
            <ProtectedRoute requireSuper={true}>
              <AdminManagement />
            </ProtectedRoute>
          } />
          
          <Route path="projects" element={<ProjectManagerPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          
          {/* 404 兜底 */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="App overflow-hidden">
        <AnimatedRoutes />
      </div>
    </Router>
  );
};

export default App;
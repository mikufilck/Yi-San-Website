import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 务实处理：当路径名改变时，强制滚动到窗口左上角
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth", // 使用 smooth 让回弹看起来更优雅，如果追求极致速度可以改为 "instant"
    });
  }, [pathname]);

  return null; // 这个组件不渲染任何内容
};

export default ScrollToTop;
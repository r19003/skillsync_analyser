import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Upload, History, LogOut, Brain, Menu, X, User,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const navItems = [
  { label: 'Dashboard',     path: '/dashboard',  icon: LayoutDashboard },
  { label: 'Upload Resume', path: '/upload',      icon: Upload },
  { label: 'History',       path: '/history',     icon: History },
  { label: 'Compare',       path: '/compare',     icon: Brain },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(10,15,30,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--color-border)',
        height: '64px',
        display: 'flex', alignItems: 'center',
        padding: '0 24px',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Brain size={20} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.15rem', background: 'linear-gradient(135deg, #818cf8, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SkillSync
          </span>
        </Link>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }} className="hidden md:flex">
          {navItems.map(({ label, path, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '8px 14px', borderRadius: '9px', textDecoration: 'none',
                  fontSize: '0.875rem', fontWeight: 500,
                  color: active ? '#818cf8' : 'var(--color-muted)',
                  background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* User chip */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.05)', borderRadius: '30px',
            padding: '5px 14px 5px 8px', border: '1px solid var(--color-border)',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <User size={14} color="#fff" />
            </div>
            <span style={{ color: 'var(--color-text)', fontSize: '0.82rem', fontWeight: 500 }}>
              {user?.name?.split(' ')[0] || 'User'}
            </span>
          </div>

          {/* Logout */}
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: '9px', padding: '8px 14px', color: '#ef4444',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '0.85rem', fontWeight: 500,
            }}
          >
            <LogOut size={15} /> Logout
          </motion.button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            style={{ background: 'none', border: 'none', color: 'var(--color-muted)', cursor: 'pointer', display: 'flex' }}
            className="md:hidden"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99,
              background: 'var(--color-surface)',
              borderBottom: '1px solid var(--color-border)',
              padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px',
            }}
          >
            {navItems.map(({ label, path, icon: Icon }) => (
              <Link
                key={path} to={path}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '11px 14px', borderRadius: '10px', textDecoration: 'none',
                  color: location.pathname === path ? '#818cf8' : 'var(--color-muted)',
                  background: location.pathname === path ? 'rgba(99,102,241,0.1)' : 'transparent',
                  fontSize: '0.9rem', fontWeight: 500,
                }}
              >
                <Icon size={17} /> {label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

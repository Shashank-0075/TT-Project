import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Navbar } from '../components/Navbar';

export const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Derive dynamic page title from current path
  const getPageTitle = (path) => {
    if (path.includes('/student/dashboard')) return 'Student Dashboard';
    if (path.includes('/staff/dashboard')) return 'Faculty & Staff Dashboard';
    if (path.includes('/admin/dashboard')) return 'Admin Dashboard';
    if (path.includes('/maintenance/dashboard')) return 'Maintenance Work Center';
    if (path.includes('/submit')) return 'Submit Complaint';
    if (path.includes('/my-complaints')) return 'My Complaints';
    if (path.includes('/complaint/')) return 'Complaint Details';
    if (path.includes('/history')) return 'Activity History';
    if (path.includes('/admin/complaints')) return 'All Complaints';
    if (path.includes('/admin/escalated')) return 'Escalated Complaints';
    if (path.includes('/admin/users')) return 'User Management';
    if (path.includes('/admin/categories')) return 'Category Management';
    if (path.includes('/admin/locations')) return 'Campus Locations';
    if (path.includes('/admin/escalation-settings')) return 'Escalation Configuration';
    if (path.includes('/maintenance/complaints')) return 'Available Maintenance Complaints';
    if (path.includes('/maintenance/resolutions')) return 'Resolution History';
    if (path.includes('/profile')) return 'User Profile';
    return 'CampusFix Portal';
  };

  return (
    <div className="app-container">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="main-wrapper">
        <Navbar
          title={getPageTitle(location.pathname)}
          toggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
        />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

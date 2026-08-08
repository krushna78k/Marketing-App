import { useState, useEffect } from 'react';
import { Users, Megaphone, CheckCircle, TrendingUp, DollarSign, Target, Download, Activity, Calendar, Bell, Clock, RefreshCw, BarChart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDashboardData } from '../services/analyticsService';
import './Dashboard.css';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a855f7'];

const Dashboard = () => {
  const [data, setData] = useState({
    metrics: { 
      totalLeads: 0, qualifiedLeads: 0, totalCampaigns: 0, activeCampaigns: 0, 
      conversionRate: 0, marketingSpend: 0, revenueGenerated: 0, roi: 0 
    },
    charts: { leadsOverTime: [], campaignsByType: [] },
    lists: { recentActivities: [], upcomingCampaigns: [], notifications: [] }
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const dashboardData = await getDashboardData();
      setData(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 500); // UI feel
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExport = () => {
    const csvContent = [
      'Metric,Value',
      `Total Leads,${data.metrics.totalLeads}`,
      `Qualified Leads,${data.metrics.qualifiedLeads}`,
      `Total Campaigns,${data.metrics.totalCampaigns}`,
      `Active Campaigns,${data.metrics.activeCampaigns}`,
      `Conversion Rate (%),${data.metrics.conversionRate}`,
      `Marketing Spend ($),${data.metrics.marketingSpend}`,
      `Revenue Generated ($),${data.metrics.revenueGenerated}`,
      `ROI (%),${data.metrics.roi}`
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'marketing_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="dashboard-container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <div style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Loading Dashboard...</div>
        </div>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* HEADER SECTION */}
      <div className="page-header">
        <div className="header-title-area">
          <h1>Analytics Overview</h1>
          <p>Comprehensive performance metrics across all marketing channels.</p>
        </div>
        <div className="header-controls">
          <select className="input-field" style={{ width: 'auto', padding: '10px' }}>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Quarter</option>
            <option>Year to Date</option>
          </select>
          <button className="btn-secondary" onClick={fetchData} title="Refresh Data">
            <RefreshCw size={16} className={refreshing ? 'spinning' : ''} />
            <style>{`.spinning { animation: spin 1s linear infinite; }`}</style>
          </button>
          <button className="btn-primary" onClick={handleExport}>
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="metric-cards">
        <div className="metric-card card">
          <div className="metric-header">
            <h3 className="metric-title">Total Leads</h3>
            <div className="metric-icon-wrapper primary"><Users size={18} /></div>
          </div>
          <div className="metric-value">{data.metrics.totalLeads?.toLocaleString() || 0}</div>
        </div>

        <div className="metric-card card">
          <div className="metric-header">
            <h3 className="metric-title">Qualified Leads</h3>
            <div className="metric-icon-wrapper success"><CheckCircle size={18} /></div>
          </div>
          <div className="metric-value">{data.metrics.qualifiedLeads?.toLocaleString() || 0}</div>
        </div>

        <div className="metric-card card">
          <div className="metric-header">
            <h3 className="metric-title">Total Campaigns</h3>
            <div className="metric-icon-wrapper purple"><Megaphone size={18} /></div>
          </div>
          <div className="metric-value">{data.metrics.totalCampaigns?.toLocaleString() || 0}</div>
        </div>

        <div className="metric-card card">
          <div className="metric-header">
            <h3 className="metric-title">Active Campaigns</h3>
            <div className="metric-icon-wrapper warning"><Activity size={18} /></div>
          </div>
          <div className="metric-value">{data.metrics.activeCampaigns?.toLocaleString() || 0}</div>
        </div>

        <div className="metric-card card">
          <div className="metric-header">
            <h3 className="metric-title">Conversion Rate</h3>
            <div className="metric-icon-wrapper success"><Target size={18} /></div>
          </div>
          <div className="metric-value">{data.metrics.conversionRate || 0}%</div>
        </div>

        <div className="metric-card card">
          <div className="metric-header">
            <h3 className="metric-title">Marketing Spend</h3>
            <div className="metric-icon-wrapper danger"><DollarSign size={18} /></div>
          </div>
          <div className="metric-value">${data.metrics.marketingSpend?.toLocaleString() || 0}</div>
        </div>

        <div className="metric-card card">
          <div className="metric-header">
            <h3 className="metric-title">Revenue Generated</h3>
            <div className="metric-icon-wrapper success"><DollarSign size={18} /></div>
          </div>
          <div className="metric-value">${data.metrics.revenueGenerated?.toLocaleString() || 0}</div>
        </div>

        <div className="metric-card card">
          <div className="metric-header">
            <h3 className="metric-title">Return on Investment</h3>
            <div className="metric-icon-wrapper success"><TrendingUp size={18} /></div>
          </div>
          <div className="metric-value">{data.metrics.roi || 0}%</div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="charts-grid">
        <div className="chart-card card">
          <div className="chart-header">
            <h3 className="chart-title">Leads Generated</h3>
          </div>
          <div className="chart-container-inner">
            {data.charts.leadsOverTime && data.charts.leadsOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.charts.leadsOverTime} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                    itemStyle={{ color: '#f8fafc', fontSize: '13px' }}
                  />
                  <Line type="monotone" dataKey="leads" name="New Leads" stroke="#6366f1" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#818cf8', strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon"><BarChart size={24} /></div>
                <h4>No lead data available</h4>
                <p style={{ fontSize: '0.85rem', marginTop: '8px', maxWidth: '250px' }}>Your lead activity will appear here once campaigns start generating leads.</p>
              </div>
            )}
          </div>
        </div>

        <div className="chart-card card">
          <div className="chart-header">
            <h3 className="chart-title">Distribution</h3>
          </div>
          <div className="chart-container-inner">
            {data.charts.campaignsByType && data.charts.campaignsByType.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.charts.campaignsByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.charts.campaignsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#f8fafc', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon"><PieChart size={24} /></div>
                <h4>No campaign data</h4>
                <p style={{ fontSize: '0.85rem', marginTop: '8px', maxWidth: '200px' }}>Start creating campaigns to see distribution analytics.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LISTS SECTION */}
      <div className="lists-grid">
        <div className="list-card card">
          <div className="list-header">
            <Activity size={18} className="text-primary" />
            <h3 className="list-title">Recent Activity</h3>
          </div>
          <div className="list-items">
            {data.lists.recentActivities && data.lists.recentActivities.length > 0 ? data.lists.recentActivities.map((act, i) => (
              <div key={i} className="list-item">
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', marginTop: '6px' }}></div>
                <div className="list-item-content">
                  <div className="list-item-title">
                    <span style={{ color: 'var(--text-muted)' }}>{act.user?.name || 'System'}</span> {act.action}
                  </div>
                  <div className="list-item-meta">{new Date(act.createdAt).toLocaleString()}</div>
                </div>
              </div>
            )) : (
              <div className="empty-state" style={{ padding: '20px' }}>
                <p>No recent activities.</p>
              </div>
            )}
          </div>
        </div>

        <div className="list-card card">
          <div className="list-header">
            <Calendar size={18} className="text-success" />
            <h3 className="list-title">Upcoming Campaigns</h3>
          </div>
          <div className="list-items">
            {data.lists.upcomingCampaigns && data.lists.upcomingCampaigns.length > 0 ? data.lists.upcomingCampaigns.map((camp, i) => (
              <div key={i} className="list-item">
                <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                  <Megaphone size={16} />
                </div>
                <div className="list-item-content">
                  <div className="list-item-title">{camp.title}</div>
                  <div className="list-item-meta" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} /> Starts: {new Date(camp.startDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )) : (
              <div className="empty-state" style={{ padding: '20px' }}>
                <p>No upcoming campaigns scheduled.</p>
              </div>
            )}
          </div>
        </div>

        <div className="list-card card">
          <div className="list-header">
            <Bell size={18} className="text-warning" />
            <h3 className="list-title">Alerts & Notifications</h3>
          </div>
          <div className="list-items">
            {data.lists.notifications && data.lists.notifications.length > 0 ? data.lists.notifications.map((notif, i) => (
              <div key={i} className="list-item">
                <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
                  <Bell size={16} />
                </div>
                <div className="list-item-content">
                  <div className="list-item-title">{notif.title}</div>
                  <div className="list-item-meta text-danger">Due: {new Date(notif.dueDate).toLocaleDateString()}</div>
                </div>
              </div>
            )) : (
              <div className="empty-state" style={{ padding: '20px' }}>
                <p>No pending notifications.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
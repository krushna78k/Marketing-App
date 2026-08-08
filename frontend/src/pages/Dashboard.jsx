import { useState, useEffect } from 'react';
import { Users, Megaphone, CheckCircle, TrendingUp, DollarSign, Target, Download, Activity, Calendar, Bell } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getDashboardData } from '../services/analyticsService';

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashboardData = await getDashboardData();
        setData(dashboardData);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
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
    link.setAttribute('download', 'analytics_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div className="page-content"><div className="loading-state">Loading dashboard...</div></div>;
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1>Analytics & Dashboard</h1>
          <p>Comprehensive overview of your marketing performance.</p>
        </div>
        <button className="btn-secondary" onClick={handleExport}>
          <Download size={18} /> Export Report
        </button>
      </div>

      <div className="metric-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div className="card glass-panel">
          <div className="card-header">
            <h3 className="card-title">Total Leads</h3>
            <Users className="text-muted" size={20} />
          </div>
          <div className="card-value">{data.metrics.totalLeads}</div>
        </div>

        <div className="card glass-panel">
          <div className="card-header">
            <h3 className="card-title">Qualified Leads</h3>
            <Users className="text-success" size={20} />
          </div>
          <div className="card-value">{data.metrics.qualifiedLeads}</div>
        </div>

        <div className="card glass-panel">
          <div className="card-header">
            <h3 className="card-title">Total Campaigns</h3>
            <Megaphone className="text-muted" size={20} />
          </div>
          <div className="card-value">{data.metrics.totalCampaigns}</div>
        </div>

        <div className="card glass-panel">
          <div className="card-header">
            <h3 className="card-title">Active Campaigns</h3>
            <Megaphone className="text-primary" size={20} />
          </div>
          <div className="card-value">{data.metrics.activeCampaigns}</div>
        </div>

        <div className="card glass-panel">
          <div className="card-header">
            <h3 className="card-title">Conversion Rate</h3>
            <CheckCircle className="text-success" size={20} />
          </div>
          <div className="card-value">{data.metrics.conversionRate}%</div>
        </div>

        <div className="card glass-panel">
          <div className="card-header">
            <h3 className="card-title">Marketing Spend</h3>
            <DollarSign className="text-muted" size={20} />
          </div>
          <div className="card-value">${data.metrics.marketingSpend.toLocaleString()}</div>
        </div>

        <div className="card glass-panel">
          <div className="card-header">
            <h3 className="card-title">Revenue Generated</h3>
            <Target className="text-success" size={20} />
          </div>
          <div className="card-value">${data.metrics.revenueGenerated.toLocaleString()}</div>
        </div>

        <div className="card glass-panel">
          <div className="card-header">
            <h3 className="card-title">ROI</h3>
            <TrendingUp className="text-success" size={20} />
          </div>
          <div className="card-value">{data.metrics.roi}%</div>
        </div>
      </div>

      <div className="dashboard-charts" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '24px', fontSize: '1.1rem' }}>Leads Generated (Last 7 Days)</h3>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <LineChart data={data.charts.leadsOverTime} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="date" stroke="#cbd5e1" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#cbd5e1" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
                <Line type="monotone" dataKey="leads" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '24px', fontSize: '1.1rem' }}>Campaign Distribution</h3>
          <div style={{ width: '100%', height: '300px' }}>
            {data.charts.campaignsByType.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data.charts.campaignsByType}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.charts.campaignsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                No campaign data yet
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-lists" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '1.1rem' }}>
            <Activity size={18} className="text-primary" /> Recent Activities
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.lists.recentActivities && data.lists.recentActivities.length > 0 ? data.lists.recentActivities.map((act, i) => (
              <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                <div style={{ fontSize: '0.95rem' }}><strong>{act.user?.name || 'System'}</strong> {act.action}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>{new Date(act.createdAt).toLocaleString()}</div>
              </div>
            )) : <div className="text-muted">No recent activities.</div>}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '1.1rem' }}>
            <Calendar size={18} className="text-primary" /> Upcoming Campaigns
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.lists.upcomingCampaigns && data.lists.upcomingCampaigns.length > 0 ? data.lists.upcomingCampaigns.map((camp, i) => (
              <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: '500' }}>{camp.title}</div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>Starts: {new Date(camp.startDate).toLocaleDateString()}</div>
              </div>
            )) : <div className="text-muted">No upcoming campaigns.</div>}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '1.1rem' }}>
            <Bell size={18} className="text-primary" /> Notifications
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.lists.notifications && data.lists.notifications.length > 0 ? data.lists.notifications.map((notif, i) => (
              <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
                <div style={{ fontSize: '0.95rem' }}>{notif.title}</div>
                <div style={{ fontSize: '0.85rem', color: '#ef4444', marginTop: '4px' }}>Due: {new Date(notif.dueDate).toLocaleDateString()}</div>
              </div>
            )) : <div className="text-muted">You have no pending notifications.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
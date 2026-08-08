import { useState, useEffect } from 'react';
import { Users, Megaphone, CheckCircle, TrendingUp, DollarSign, Target, Download, Activity, Calendar, Bell } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
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
    return <div className="dashboard-container"><div className="loading-state">Loading dashboard...</div></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <div>
          <h1>Analytics & Dashboard</h1>
          <p>Comprehensive overview of your marketing performance.</p>
        </div>
        <button className="btn-secondary" onClick={handleExport}>
          <Download size={16} /> Export
        </button>
      </div>

      <div className="metric-cards">
        <div className="card glass-panel">
          <div className="card-header">
            <h3 className="card-title">Total Leads</h3>
            <Users className="text-muted" size={16} />
          </div>
          <div className="card-value">{data.metrics.totalLeads}</div>
        </div>

        <div className="card glass-panel">
          <div className="card-header">
            <h3 className="card-title">Qualified Leads</h3>
            <Users className="text-success" size={16} />
          </div>
          <div className="card-value">{data.metrics.qualifiedLeads}</div>
        </div>

        <div className="card glass-panel">
          <div className="card-header">
            <h3 className="card-title">Total Campaigns</h3>
            <Megaphone className="text-muted" size={16} />
          </div>
          <div className="card-value">{data.metrics.totalCampaigns}</div>
        </div>

        <div className="card glass-panel">
          <div className="card-header">
            <h3 className="card-title">Active Campaigns</h3>
            <Megaphone className="text-primary" size={16} />
          </div>
          <div className="card-value">{data.metrics.activeCampaigns}</div>
        </div>

        <div className="card glass-panel">
          <div className="card-header">
            <h3 className="card-title">Conversion Rate</h3>
            <CheckCircle className="text-success" size={16} />
          </div>
          <div className="card-value">{data.metrics.conversionRate}%</div>
        </div>

        <div className="card glass-panel">
          <div className="card-header">
            <h3 className="card-title">Marketing Spend</h3>
            <DollarSign className="text-muted" size={16} />
          </div>
          <div className="card-value">${data.metrics.marketingSpend.toLocaleString()}</div>
        </div>

        <div className="card glass-panel">
          <div className="card-header">
            <h3 className="card-title">Revenue</h3>
            <Target className="text-success" size={16} />
          </div>
          <div className="card-value">${data.metrics.revenueGenerated.toLocaleString()}</div>
        </div>

        <div className="card glass-panel">
          <div className="card-header">
            <h3 className="card-title">ROI</h3>
            <TrendingUp className="text-success" size={16} />
          </div>
          <div className="card-value">{data.metrics.roi}%</div>
        </div>
      </div>

      <div className="dashboard-middle">
        <div className="glass-panel dashboard-box">
          <h3>Leads Generated (Last 7 Days)</h3>
          <div className="chart-container">
            <ResponsiveContainer>
              <LineChart data={data.charts.leadsOverTime} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="date" stroke="#cbd5e1" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#cbd5e1" fontSize={11} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#f8fafc', fontSize: '13px' }}
                />
                <Line type="monotone" dataKey="leads" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', strokeWidth: 2, r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel dashboard-box">
          <h3>Campaign Distribution</h3>
          <div className="chart-container">
            {data.charts.campaignsByType.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data.charts.campaignsByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.charts.campaignsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#f8fafc', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">No campaign data</div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-lists">
        <div className="glass-panel dashboard-box">
          <h3><Activity size={16} className="text-primary" /> Recent Activities</h3>
          <div className="list-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.lists.recentActivities && data.lists.recentActivities.length > 0 ? data.lists.recentActivities.map((act, i) => (
              <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <div style={{ fontSize: '0.85rem' }}><strong>{act.user?.name || 'System'}</strong> {act.action}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{new Date(act.createdAt).toLocaleString()}</div>
              </div>
            )) : <div className="text-muted" style={{ fontSize: '0.85rem' }}>No recent activities.</div>}
          </div>
        </div>

        <div className="glass-panel dashboard-box">
          <h3><Calendar size={16} className="text-primary" /> Upcoming Campaigns</h3>
          <div className="list-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.lists.upcomingCampaigns && data.lists.upcomingCampaigns.length > 0 ? data.lists.upcomingCampaigns.map((camp, i) => (
              <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>{camp.title}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Starts: {new Date(camp.startDate).toLocaleDateString()}</div>
              </div>
            )) : <div className="text-muted" style={{ fontSize: '0.85rem' }}>No upcoming campaigns.</div>}
          </div>
        </div>

        <div className="glass-panel dashboard-box">
          <h3><Bell size={16} className="text-primary" /> Notifications</h3>
          <div className="list-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.lists.notifications && data.lists.notifications.length > 0 ? data.lists.notifications.map((notif, i) => (
              <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
                <div style={{ fontSize: '0.85rem' }}>{notif.title}</div>
                <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '2px' }}>Due: {new Date(notif.dueDate).toLocaleDateString()}</div>
              </div>
            )) : <div className="text-muted" style={{ fontSize: '0.85rem' }}>No pending notifications.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
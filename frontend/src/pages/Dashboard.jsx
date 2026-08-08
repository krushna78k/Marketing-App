import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Users, Megaphone, CheckCircle, TrendingUp, DollarSign, Target, Download, Activity, Calendar, Bell, Clock, RefreshCw, BarChart, ArrowRight, Layers, PieChart as PieIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDashboardData } from '../services/analyticsService';
import { AuthContext } from '../context/AuthContext';
import './Dashboard.css';

const COLORS = ['#7C6CFF', '#10B981', '#F59E0B', '#EF4444', '#A855F7', '#3B82F6'];

const Dashboard = () => {
  const { user } = useContext(AuthContext);
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
  const [timeRange, setTimeRange] = useState('30D');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const dashboardData = await getDashboardData();
      setData(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
      setTimeout(() => setRefreshing(false), 500);
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
      <div className="dashboard-container loader-view">
        <div className="loader-box">
          <div className="spin-ring"></div>
          <div className="loader-text">Loading Workspace Dashboard...</div>
        </div>
      </div>
    );
  }

  const notificationCount = data.lists.notifications ? data.lists.notifications.length : 0;

  return (
    <div className="dashboard-container">
      
      {/* EDITORIAL HEADER SECTION */}
      <div className="dash-page-header">
        <div className="dash-header-title-area">
          <div className="dash-breadcrumb">
            <span>Dashboard</span>
            <span className="crumb-sep">/</span>
            <span className="crumb-active">Overview</span>
          </div>
          <h1>{getGreeting()}, {user?.name || 'krushna kamble'}</h1>
          <p>Analytics Overview — Track your marketing performance across every channel.</p>
        </div>

        <div className="dash-header-controls">
          <div className="date-select-wrapper">
            <Calendar size={15} className="select-icon" />
            <select className="input-field dash-select">
              <option>Last 7 Days</option>
              <option selected>Last 30 Days</option>
              <option>This Quarter</option>
              <option>Year to Date</option>
            </select>
          </div>

          <button className="btn-secondary dash-ctrl-btn" onClick={fetchData} title="Refresh Data">
            <RefreshCw size={15} className={refreshing ? 'spinning' : ''} />
          </button>

          {notificationCount > 0 && (
            <button className="btn-secondary dash-ctrl-btn notif-btn" title="Notifications">
              <Bell size={15} />
              <span className="notif-dot"></span>
            </button>
          )}

          <button className="btn-primary" onClick={handleExport}>
            <Download size={15} /> Export
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS GRID (8 Metrics) */}
      <div className="metric-cards">
        <div className="metric-card card">
          <div className="metric-header">
            <span className="metric-title">Total Leads</span>
            <div className="metric-icon-wrapper primary"><Users size={17} /></div>
          </div>
          <div className="metric-value">{data.metrics.totalLeads?.toLocaleString() || 0}</div>
        </div>

        <div className="metric-card card">
          <div className="metric-header">
            <span className="metric-title">Qualified Leads</span>
            <div className="metric-icon-wrapper success"><CheckCircle size={17} /></div>
          </div>
          <div className="metric-value">{data.metrics.qualifiedLeads?.toLocaleString() || 0}</div>
        </div>

        <div className="metric-card card">
          <div className="metric-header">
            <span className="metric-title">Total Campaigns</span>
            <div className="metric-icon-wrapper purple"><Megaphone size={17} /></div>
          </div>
          <div className="metric-value">{data.metrics.totalCampaigns?.toLocaleString() || 0}</div>
        </div>

        <div className="metric-card card">
          <div className="metric-header">
            <span className="metric-title">Active Campaigns</span>
            <div className="metric-icon-wrapper warning"><Activity size={17} /></div>
          </div>
          <div className="metric-value">{data.metrics.activeCampaigns?.toLocaleString() || 0}</div>
        </div>

        <div className="metric-card card">
          <div className="metric-header">
            <span className="metric-title">Conversion Rate</span>
            <div className="metric-icon-wrapper success"><Target size={17} /></div>
          </div>
          <div className="metric-value">{data.metrics.conversionRate || 0}%</div>
        </div>

        <div className="metric-card card">
          <div className="metric-header">
            <span className="metric-title">Marketing Spend</span>
            <div className="metric-icon-wrapper danger"><DollarSign size={17} /></div>
          </div>
          <div className="metric-value">${data.metrics.marketingSpend?.toLocaleString() || 0}</div>
        </div>

        <div className="metric-card card">
          <div className="metric-header">
            <span className="metric-title">Revenue Generated</span>
            <div className="metric-icon-wrapper success"><TrendingUp size={17} /></div>
          </div>
          <div className="metric-value">${data.metrics.revenueGenerated?.toLocaleString() || 0}</div>
        </div>

        <div className="metric-card card">
          <div className="metric-header">
            <span className="metric-title">Return on Investment</span>
            <div className="metric-icon-wrapper primary"><BarChart size={17} /></div>
          </div>
          <div className="metric-value">{data.metrics.roi || 0}%</div>
        </div>
      </div>

      {/* MAIN ANALYTICS CHARTS SECTION */}
      <div className="charts-grid">
        
        {/* Primary Analytics Panel (2/3 width) */}
        <div className="chart-card card primary-chart-panel">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Leads Generated</h3>
              <p className="chart-sub">Track lead generation performance over time.</p>
            </div>
            <div className="range-pills">
              {['7D', '30D', '90D', '1Y'].map((range) => (
                <button 
                  key={range} 
                  className={`range-pill ${timeRange === range ? 'active' : ''}`}
                  onClick={() => setTimeRange(range)}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="chart-container-inner">
            {data.charts.leadsOverTime && data.charts.leadsOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.charts.leadsOverTime} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C6CFF" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#7C6CFF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#141A25', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
                    itemStyle={{ color: '#F8FAFC', fontSize: '13px', fontWeight: 600 }}
                  />
                  <Line type="monotone" dataKey="leads" name="New Leads" stroke="#7C6CFF" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#7C6CFF', strokeWidth: 2, stroke: '#ffffff' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state-box">
                <div className="empty-icon-circle"><BarChart size={22} /></div>
                <h4>No lead data yet</h4>
                <p>Your lead generation activity will appear here once campaigns start generating leads.</p>
              </div>
            )}
          </div>
        </div>

        {/* Secondary Analytics Panel (1/3 width) */}
        <div className="chart-card card secondary-chart-panel">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Campaign Distribution</h3>
              <p className="chart-sub">Breakdown by channel</p>
            </div>
          </div>

          <div className="chart-container-inner">
            {data.charts.campaignsByType && data.charts.campaignsByType.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.charts.campaignsByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={88}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.charts.campaignsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#141A25', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px' }}
                    itemStyle={{ color: '#F8FAFC', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state-box">
                <div className="empty-icon-circle"><PieIcon size={22} /></div>
                <h4>No campaign data</h4>
                <p>Start creating campaigns to see your distribution analytics.</p>
                <Link to="/campaigns" className="btn-secondary empty-cta">
                  <span>Create Campaign</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* LOWER DASHBOARD PANELS & EMPTY STATES */}
      <div className="lists-grid">
        
        {/* Recent Activity */}
        <div className="list-card card">
          <div className="list-header">
            <div className="panel-title-group">
              <Activity size={16} className="panel-icon text-primary" />
              <h3>Recent Activity</h3>
            </div>
          </div>
          <div className="list-items">
            {data.lists.recentActivities && data.lists.recentActivities.length > 0 ? (
              data.lists.recentActivities.map((act, i) => (
                <div key={i} className="list-item">
                  <div className="item-dot"></div>
                  <div className="list-item-content">
                    <div className="list-item-title">
                      <span className="user-name-tag">{act.user?.name || 'System'}</span> {act.action}
                    </div>
                    <div className="list-item-meta">{new Date(act.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state-box mini-empty">
                <div className="empty-icon-sm"><Activity size={18} /></div>
                <h4>No recent activity</h4>
                <p>Your latest marketing activity will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Campaigns */}
        <div className="list-card card">
          <div className="list-header">
            <div className="panel-title-group">
              <Calendar size={16} className="panel-icon text-success" />
              <h3>Upcoming Campaigns</h3>
            </div>
          </div>
          <div className="list-items">
            {data.lists.upcomingCampaigns && data.lists.upcomingCampaigns.length > 0 ? (
              data.lists.upcomingCampaigns.map((camp, i) => (
                <div key={i} className="list-item">
                  <div className="item-badge success-badge"><Megaphone size={14} /></div>
                  <div className="list-item-content">
                    <div className="list-item-title">{camp.title}</div>
                    <div className="list-item-meta"><Clock size={12} /> Starts: {new Date(camp.startDate).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state-box mini-empty">
                <div className="empty-icon-sm"><Calendar size={18} /></div>
                <h4>No upcoming campaigns</h4>
                <p>Schedule a campaign to see it here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="list-card card">
          <div className="list-header">
            <div className="panel-title-group">
              <Bell size={16} className="panel-icon text-warning" />
              <h3>Notifications</h3>
            </div>
          </div>
          <div className="list-items">
            {data.lists.notifications && data.lists.notifications.length > 0 ? (
              data.lists.notifications.map((notif, i) => (
                <div key={i} className="list-item">
                  <div className="item-badge warning-badge"><Bell size={14} /></div>
                  <div className="list-item-content">
                    <div className="list-item-title">{notif.title}</div>
                    <div className="list-item-meta text-danger">Due: {new Date(notif.dueDate).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state-box mini-empty">
                <div className="empty-icon-sm"><Bell size={18} /></div>
                <h4>You're all caught up</h4>
                <p>No new notifications right now.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
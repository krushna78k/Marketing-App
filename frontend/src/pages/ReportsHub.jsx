import { useState, useEffect } from 'react';
import { Download, PieChart as PieChartIcon, BarChart2, Mail, MessageSquare, Activity, Globe, MessageCircle } from 'lucide-react';
import { PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

import './ReportsHub.css';

const COLORS = ['#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#3b82f6', '#10b981'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rh-custom-tooltip">
        {label && <div className="rh-tooltip-label">{label}</div>}
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="rh-tooltip-item" style={{ color: entry.color }}>
            <span>{entry.name || 'Count'}</span>
            <span style={{ fontWeight: 700 }}>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ReportsHub = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'channels', 'sources'
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/analytics/reports`, {
        headers: { 'x-auth-token': token }
      });
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      }
    } catch (err) {
      console.error('Error fetching reports', err);
    } finally {
      setLoading(false);
    }
  };

  // EXPORT FUNCTIONS
  const exportPDF = () => {
    if (!reportData) return;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Marketing Analytics & Reporting Suite', 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    // 1. Funnel Table
    doc.setFontSize(14);
    doc.text('Conversion Funnel', 14, 45);
    doc.autoTable({
      startY: 50,
      head: [['Stage', 'Count']],
      body: reportData.funnel.map(item => [item.name, item.value]),
      theme: 'grid',
      headStyles: { fillColor: [139, 92, 246] }
    });

    // 2. Channels Table
    doc.text('Channel Performance', 14, doc.lastAutoTable.finalY + 15);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Channel', 'Metric', 'Count']],
      body: [
        ['Email', 'Total Sent', reportData.email.total],
        ['Email', 'Opened', reportData.email.opened],
        ['Email', 'Bounced', reportData.email.bounced],
        ['SMS', 'Total Sent', reportData.sms.total],
        ['SMS', 'Delivered', reportData.sms.delivered],
        ['SMS', 'Failed', reportData.sms.failed],
        ['WhatsApp', 'Total Sent', reportData.whatsapp.total],
        ['WhatsApp', 'Read', reportData.whatsapp.read]
      ],
      theme: 'grid',
      headStyles: { fillColor: [20, 184, 166] }
    });

    // 3. Sources Table
    doc.text('Lead Sources Breakdown', 14, doc.lastAutoTable.finalY + 15);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Source', 'Count']],
      body: reportData.sources.map(item => [item.name, item.value]),
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11] }
    });

    doc.save('Analytics_Report.pdf');
  };

  const exportExcel = () => {
    if (!reportData) return;
    
    const wsFunnel = XLSX.utils.json_to_sheet(reportData.funnel);
    const wsSources = XLSX.utils.json_to_sheet(reportData.sources);
    const wsChannels = XLSX.utils.json_to_sheet([
      { Channel: 'Email', Total: reportData.email.total, Success: reportData.email.opened, Failed: reportData.email.bounced },
      { Channel: 'SMS', Total: reportData.sms.total, Success: reportData.sms.delivered, Failed: reportData.sms.failed },
      { Channel: 'WhatsApp', Total: reportData.whatsapp.total, Success: reportData.whatsapp.read, Failed: 0 }
    ]);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsFunnel, "Conversion Funnel");
    XLSX.utils.book_append_sheet(wb, wsChannels, "Channel Analytics");
    XLSX.utils.book_append_sheet(wb, wsSources, "Lead Sources");

    XLSX.writeFile(wb, 'Analytics_Report.xlsx');
  };

  const exportCSV = () => {
    if (!reportData) return;
    let csv = 'Category,Metric,Value\n';
    
    reportData.funnel.forEach(item => { csv += `Funnel,${item.name},${item.value}\n`; });
    reportData.sources.forEach(item => { csv += `Sources,${item.name},${item.value}\n`; });
    csv += `Email,Total,${reportData.email.total}\n`;
    csv += `Email,Opened,${reportData.email.opened}\n`;
    csv += `Email,Bounced,${reportData.email.bounced}\n`;
    csv += `SMS,Total,${reportData.sms.total}\n`;
    csv += `SMS,Delivered,${reportData.sms.delivered}\n`;
    csv += `SMS,Failed,${reportData.sms.failed}\n`;
    csv += `WhatsApp,Total,${reportData.whatsapp.total}\n`;
    csv += `WhatsApp,Read,${reportData.whatsapp.read}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'Analytics_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="page-content"><div className="loading-state">Loading Reports Hub...</div></div>;

  return (
    <div className="reports-hub">
      <div className="rh-header">
        <div className="rh-title-wrapper">
          <h1>
            <BarChart2 size={32} color="#10b981" /> Reports & Analytics
          </h1>
          <p>Deep-dive into your Campaign Performance, Lead Sources, and Marketing Channels.</p>
        </div>
        
        <div className="rh-actions-bar">
          <div className="rh-tabs">
            <button className={`rh-tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <Activity size={18} /> Overview
            </button>
            <button className={`rh-tab-btn ${activeTab === 'channels' ? 'active' : ''}`} onClick={() => setActiveTab('channels')}>
              <MessageSquare size={18} /> Channels
            </button>
            <button className={`rh-tab-btn ${activeTab === 'sources' ? 'active' : ''}`} onClick={() => setActiveTab('sources')}>
              <Globe size={18} /> Sources
            </button>
          </div>
          
          <div className="rh-export-group">
             <button className="rh-btn rh-btn-csv" onClick={exportCSV} title="Export CSV"><Download size={18} /> CSV</button>
             <button className="rh-btn rh-btn-excel" onClick={exportExcel} title="Export Excel"><Download size={18} /> Excel</button>
             <button className="rh-btn rh-btn-pdf" onClick={exportPDF} title="Export PDF"><Download size={18} /> PDF</button>
          </div>
        </div>
      </div>

      <div className="rh-content">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && reportData && (
          <div className="rh-tab-pane rh-container-centered">
            <h2 className="rh-section-title">Conversion Funnel</h2>
            <div className="card" style={{ height: '500px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.funnel} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#cbd5e1" tickLine={false} axisLine={false} tick={{ fill: '#cbd5e1', fontSize: 13 }} />
                  <YAxis stroke="#cbd5e1" tickLine={false} axisLine={false} tick={{ fill: '#cbd5e1', fontSize: 13 }} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]} maxBarSize={70}>
                    {reportData.funnel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHANNELS TAB */}
        {activeTab === 'channels' && reportData && (
          <div className="rh-tab-pane rh-grid-3">
            
            <div className="card rh-stat-card rh-theme-email">
               <div className="rh-stat-header">
                 <div className="rh-stat-icon-wrapper">
                   <Mail size={24} />
                 </div>
                 <h3 className="rh-stat-title">Email Performance</h3>
               </div>
               
               <div className="rh-stat-row">
                 <span className="rh-stat-label">Total Sent</span>
                 <span className="rh-stat-value">{reportData.email.total}</span>
               </div>
               <div className="rh-stat-row highlight">
                 <span className="rh-stat-label">Opened / Clicked</span>
                 <span className="rh-stat-value" style={{ color: '#10b981' }}>{reportData.email.opened}</span>
               </div>
               <div className="rh-stat-row warning">
                 <span className="rh-stat-label">Bounced</span>
                 <span className="rh-stat-value" style={{ color: '#ef4444' }}>{reportData.email.bounced}</span>
               </div>
            </div>

            <div className="card rh-stat-card rh-theme-sms">
               <div className="rh-stat-header">
                 <div className="rh-stat-icon-wrapper">
                   <MessageSquare size={24} />
                 </div>
                 <h3 className="rh-stat-title">SMS Reach</h3>
               </div>
               
               <div className="rh-stat-row">
                 <span className="rh-stat-label">Total Dispatched</span>
                 <span className="rh-stat-value">{reportData.sms.total}</span>
               </div>
               <div className="rh-stat-row highlight">
                 <span className="rh-stat-label">Delivered Successfully</span>
                 <span className="rh-stat-value" style={{ color: '#10b981' }}>{reportData.sms.delivered}</span>
               </div>
               <div className="rh-stat-row warning">
                 <span className="rh-stat-label">Failed Delivery</span>
                 <span className="rh-stat-value" style={{ color: '#ef4444' }}>{reportData.sms.failed}</span>
               </div>
            </div>

            <div className="card rh-stat-card rh-theme-whatsapp">
               <div className="rh-stat-header">
                 <div className="rh-stat-icon-wrapper">
                   <MessageCircle size={24} />
                 </div>
                 <h3 className="rh-stat-title">WhatsApp Engagement</h3>
               </div>
               
               <div className="rh-stat-row">
                 <span className="rh-stat-label">Total Dispatched</span>
                 <span className="rh-stat-value">{reportData.whatsapp.total}</span>
               </div>
               <div className="rh-stat-row highlight">
                 <span className="rh-stat-label">Read Receipts</span>
                 <span className="rh-stat-value" style={{ color: '#38bdf8' }}>{reportData.whatsapp.read}</span>
               </div>
               <div className="rh-stat-row success">
                 <span className="rh-stat-label">Delivered</span>
                 <span className="rh-stat-value" style={{ color: '#10b981' }}>{reportData.whatsapp.delivered}</span>
               </div>
            </div>

          </div>
        )}

        {/* SOURCES TAB */}
        {activeTab === 'sources' && reportData && (
          <div className="rh-tab-pane rh-container-centered">
            <h2 className="rh-section-title">Lead Source Distribution</h2>
            <div className="card" style={{ height: '550px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {reportData.sources.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reportData.sources}
                      cx="50%"
                      cy="45%"
                      innerRadius={100}
                      outerRadius={160}
                      paddingAngle={6}
                      dataKey="value"
                      stroke="none"
                    >
                      {reportData.sources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={40} iconType="circle" wrapperStyle={{ fontSize: '15px', color: '#cbd5e1' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ color: '#94a3b8', fontSize: '1.2rem' }}>No source data available.</div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ReportsHub;

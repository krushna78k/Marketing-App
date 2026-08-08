import { useState, useEffect } from 'react';
import { Download, PieChart as PieChartIcon, BarChart2, Mail, MessageSquare, Activity, Globe, MessageCircle } from 'lucide-react';
import { PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Reusing premium tab styles
import './EmailBuilder.css'; 

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4'];

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
      headStyles: { fillColor: [99, 102, 241] }
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
      headStyles: { fillColor: [16, 185, 129] }
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
    
    // Construct Worksheets
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
    <div className="page-content email-builder-wrapper" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 40px)' }}>
      <div className="page-header" style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '16px', alignItems: 'center' }}>
        <div style={{ flex: '1 1 300px' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 size={28} color="#10b981" /> Reports & Analytics Hub
          </h1>
          <p>Deep-dive into your Campaign Performance, Lead Sources, and Marketing Channels.</p>
        </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <div className="tab-navigation" style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '8px', flexWrap: 'wrap' }}>
            <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <Activity size={16} /> Overview
            </button>
            <button className={`tab-btn ${activeTab === 'channels' ? 'active' : ''}`} onClick={() => setActiveTab('channels')}>
              <MessageSquare size={16} /> Channels
            </button>
            <button className={`tab-btn ${activeTab === 'sources' ? 'active' : ''}`} onClick={() => setActiveTab('sources')}>
              <Globe size={16} /> Sources
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
             <button className="btn-secondary" onClick={exportCSV} title="Export CSV" style={{ padding: '8px' }}><Download size={18} /> CSV</button>
             <button className="btn-secondary" onClick={exportExcel} title="Export Excel" style={{ padding: '8px', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}><Download size={18} /> Excel</button>
             <button className="btn-primary" onClick={exportPDF} title="Export PDF" style={{ padding: '8px', background: '#ef4444' }}><Download size={18} /> PDF</button>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && reportData && (
          <div style={{ padding: '32px 16px', maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '24px', color: '#f8fafc' }}>Conversion Funnel</h2>
            <div className="glass-panel" style={{ padding: '32px', height: '400px' }}>
              <ResponsiveContainer>
                <BarChart data={reportData.funnel} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="#cbd5e1" tickLine={false} axisLine={false} />
                  <YAxis stroke="#cbd5e1" tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} maxBarSize={60}>
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
          <div style={{ padding: '32px 16px', maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            
            <div className="glass-panel" style={{ padding: '24px' }}>
               <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#3b82f6' }}>
                 <Mail size={20} /> Email Analytics
               </h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                   <span style={{ color: '#94a3b8' }}>Total Sent</span>
                   <span style={{ fontWeight: 'bold' }}>{reportData.email.total}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                   <span style={{ color: '#34d399' }}>Opened / Clicked</span>
                   <span style={{ fontWeight: 'bold', color: '#10b981' }}>{reportData.email.opened}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                   <span style={{ color: '#fca5a5' }}>Bounced</span>
                   <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{reportData.email.bounced}</span>
                 </div>
               </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
               <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#f59e0b' }}>
                 <MessageSquare size={20} /> SMS Analytics
               </h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                   <span style={{ color: '#94a3b8' }}>Total Dispatched</span>
                   <span style={{ fontWeight: 'bold' }}>{reportData.sms.total}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                   <span style={{ color: '#34d399' }}>Delivered</span>
                   <span style={{ fontWeight: 'bold', color: '#10b981' }}>{reportData.sms.delivered}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                   <span style={{ color: '#fca5a5' }}>Failed Delivery</span>
                   <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{reportData.sms.failed}</span>
                 </div>
               </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
               <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#25D366' }}>
                 <MessageCircle size={20} /> WhatsApp Analytics
               </h3>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                   <span style={{ color: '#94a3b8' }}>Total Dispatched</span>
                   <span style={{ fontWeight: 'bold' }}>{reportData.whatsapp.total}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '8px' }}>
                   <span style={{ color: '#7dd3fc' }}>Read Receipts</span>
                   <span style={{ fontWeight: 'bold', color: '#38bdf8' }}>{reportData.whatsapp.read}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                   <span style={{ color: '#34d399' }}>Delivered</span>
                   <span style={{ fontWeight: 'bold', color: '#10b981' }}>{reportData.whatsapp.delivered}</span>
                 </div>
               </div>
            </div>

          </div>
        )}

        {/* SOURCES TAB */}
        {activeTab === 'sources' && reportData && (
          <div style={{ padding: '32px 16px', maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '24px', color: '#f8fafc' }}>Lead Source Distribution</h2>
            <div className="glass-panel" style={{ padding: '32px', height: '450px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {reportData.sources.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={reportData.sources}
                      cx="50%"
                      cy="45%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {reportData.sources.map((entry, index) => (
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
                <div className="text-muted">No source data available.</div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ReportsHub;

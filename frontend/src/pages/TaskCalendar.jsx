import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getCalendarEvents } from '../services/calendarService';
import { createTask, updateTask, addTaskComment, addTaskAttachment } from '../services/taskService';
import { getUsers } from '../services/userService';
import { Plus, X, MessageSquare, Paperclip, CheckCircle, Clock, Activity, Calendar as CalendarIcon, Megaphone, Users as UsersIcon, Globe } from 'lucide-react';
import './TaskCalendar.css';

const localizer = momentLocalizer(moment);

const EVENT_TYPES = ['All', 'Task', 'Meeting', 'Event', 'Campaign', 'Follow-up', 'Social Post'];

const TaskCalendar = () => {
  const [allEvents, setAllEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showGenericModal, setShowGenericModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Forms
  const [formData, setFormData] = useState({ title: '', dueDate: '', priority: 'Medium', assignedTo: '', eventType: 'Task' });
  const [newComment, setNewComment] = useState('');
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsData, usersData] = await Promise.all([getCalendarEvents(), getUsers()]);
      
      const mappedEvents = eventsData.map(ev => ({
        ...ev,
        start: new Date(ev.start),
        end: new Date(ev.end),
        allDay: true
      }));
      
      setAllEvents(mappedEvents);
      setFilteredEvents(mappedEvents);
      setUsers(usersData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeFilter === 'All') {
      setFilteredEvents(allEvents);
    } else {
      setFilteredEvents(allEvents.filter(e => e.type === activeFilter));
    }
  }, [activeFilter, allEvents]);

  // --- Add Task Logic ---
  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = { ...formData };
      if (!dataToSubmit.assignedTo) delete dataToSubmit.assignedTo;
      
      await createTask(dataToSubmit);
      setShowAddModal(false);
      setFormData({ title: '', dueDate: '', priority: 'Medium', assignedTo: '', eventType: 'Task' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // --- Task Details Logic ---
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    if (['Task', 'Meeting', 'Event'].includes(event.type)) {
      setShowTaskModal(true);
    } else {
      setShowGenericModal(true);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      const updated = await updateTask(selectedEvent.resource._id, { status: newStatus });
      setSelectedEvent({ ...selectedEvent, resource: updated });
      fetchData(); // sync calendar in background
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const updated = await addTaskComment(selectedEvent.resource._id, newComment);
      setSelectedEvent({ ...selectedEvent, resource: updated });
      setNewComment('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAttachment = async (e) => {
    e.preventDefault();
    if (!newAttachmentUrl.trim()) return;
    try {
      const updated = await addTaskAttachment(selectedEvent.resource._id, newAttachmentUrl, 'Attached Link');
      setSelectedEvent({ ...selectedEvent, resource: updated });
      setNewAttachmentUrl('');
    } catch (err) {
      console.error(err);
    }
  };

  // UI Helpers
  const eventStyleGetter = (event) => {
    let backgroundColor = '#6366f1'; // Default Task
    if (event.type === 'Meeting') backgroundColor = '#eab308';
    if (event.type === 'Event') backgroundColor = '#ef4444';
    if (event.type === 'Campaign') backgroundColor = '#a855f7';
    if (event.type === 'Follow-up') backgroundColor = '#10b981';
    if (event.type === 'Social Post') backgroundColor = '#38bdf8';
    
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  const getPriorityColor = (priority) => {
    if (priority === 'High') return '#ef4444';
    if (priority === 'Medium') return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div className="page-header" style={{ paddingBottom: '16px', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div>
          <h1>Unified Calendar</h1>
          <p>Manage Tasks, Meetings, Campaigns, and Lead Follow-ups in one place.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Schedule Task / Meeting
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {EVENT_TYPES.map(type => (
          <button 
            key={type}
            className={`badge ${activeFilter === type ? '' : 'badge-outline'}`}
            style={{ 
              cursor: 'pointer', 
              padding: '6px 12px', 
              fontSize: '0.85rem',
              backgroundColor: activeFilter === type ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
              borderColor: activeFilter === type ? '#6366f1' : 'rgba(255,255,255,0.2)',
              color: activeFilter === type ? '#818cf8' : '#cbd5e1'
            }}
            onClick={() => setActiveFilter(type)}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="glass-panel" style={{ flex: 1, padding: '24px', overflow: 'hidden' }}>
        {loading ? (
          <div className="loading-state">Loading calendar...</div>
        ) : (
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            style={{ height: '100%' }}
            views={['month', 'week', 'day']}
          />
        )}
      </div>

      {/* CREATE TASK MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: '500px' }}>
            <h2>Schedule New Event</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input type="text" name="title" className="input-field" value={formData.title} onChange={handleInputChange} required />
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Type</label>
                  <select name="eventType" className="input-field" value={formData.eventType} onChange={handleInputChange}>
                    <option value="Task">Task</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Event">Event</option>
                  </select>
                </div>
                <div className="form-group half">
                  <label>Date & Time</label>
                  <input type="datetime-local" name="dueDate" className="input-field" value={formData.dueDate} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Priority</label>
                  <select name="priority" className="input-field" value={formData.priority} onChange={handleInputChange}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="form-group half">
                  <label>Assign To</label>
                  <select name="assignedTo" className="input-field" value={formData.assignedTo} onChange={handleInputChange}>
                    <option value="">-- Select User --</option>
                    {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILED MODAL FOR TASKS/MEETINGS/EVENTS */}
      {showTaskModal && selectedEvent && (
        <div className="modal-overlay" style={{ overflowY: 'auto' }}>
          <div className="modal-content glass-panel" style={{ maxWidth: '800px', margin: '40px auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ marginBottom: '8px' }}>
                  <span className="badge" style={{ marginRight: '8px', backgroundColor: '#6366f1', color: 'white' }}>{selectedEvent.type}</span>
                  {selectedEvent.title}
                </h2>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span className="badge" style={{ backgroundColor: getPriorityColor(selectedEvent.resource.priority), color: 'white' }}>{selectedEvent.resource.priority} Priority</span>
                  <span className="text-muted text-sm">Scheduled: {selectedEvent.start.toLocaleString()}</span>
                  <span className="text-muted text-sm">Assigned: {selectedEvent.resource.assignedTo?.name || 'Unassigned'}</span>
                </div>
              </div>
              <button className="action-btn" onClick={() => setShowTaskModal(false)}><X size={24} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* LEFT COLUMN */}
              <div>
                <h3 className="form-section-title">Status</h3>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                  <button 
                    className={`btn-secondary ${selectedEvent.resource.status === 'Pending' ? 'active-status-btn' : ''}`}
                    onClick={() => handleUpdateStatus('Pending')}
                    style={selectedEvent.resource.status === 'Pending' ? { background: '#f59e0b', color: 'white', borderColor: '#f59e0b' } : {}}
                  >
                    <Clock size={16} /> Pending
                  </button>
                  <button 
                    className={`btn-secondary ${selectedEvent.resource.status === 'In Progress' ? 'active-status-btn' : ''}`}
                    onClick={() => handleUpdateStatus('In Progress')}
                    style={selectedEvent.resource.status === 'In Progress' ? { background: '#3b82f6', color: 'white', borderColor: '#3b82f6' } : {}}
                  >
                    <Activity size={16} /> In Progress
                  </button>
                  <button 
                    className={`btn-secondary ${selectedEvent.resource.status === 'Completed' ? 'active-status-btn' : ''}`}
                    onClick={() => handleUpdateStatus('Completed')}
                    style={selectedEvent.resource.status === 'Completed' ? { background: '#10b981', color: 'white', borderColor: '#10b981' } : {}}
                  >
                    <CheckCircle size={16} /> Completed
                  </button>
                </div>

                <h3 className="form-section-title">Attachments</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {selectedEvent.resource.attachments && selectedEvent.resource.attachments.length > 0 ? (
                    selectedEvent.resource.attachments.map((att, idx) => (
                      <a key={idx} href={att.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', textDecoration: 'none', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
                        <Paperclip size={16} /> {att.name || att.url}
                      </a>
                    ))
                  ) : (
                    <div className="text-muted text-sm">No attachments yet.</div>
                  )}
                </div>
                <form onSubmit={handleAddAttachment} style={{ display: 'flex', gap: '8px' }}>
                  <input type="url" className="input-field" placeholder="Paste link (Google Drive...)" value={newAttachmentUrl} onChange={(e) => setNewAttachmentUrl(e.target.value)} required />
                  <button type="submit" className="btn-secondary">Add</button>
                </form>
              </div>

              {/* RIGHT COLUMN */}
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: '8px' }}>
                <h3 className="form-section-title" style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={18} /> Discussion
                </h3>
                
                <div style={{ height: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px', paddingRight: '8px' }}>
                  {selectedEvent.resource.comments && selectedEvent.resource.comments.length > 0 ? (
                    selectedEvent.resource.comments.map((comment, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontWeight: 'bold', color: '#38bdf8', fontSize: '0.9rem' }}>{comment.userName}</span>
                          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{new Date(comment.date).toLocaleString()}</span>
                        </div>
                        <div style={{ color: '#f8fafc', fontSize: '0.95rem', lineHeight: '1.4' }}>
                          {comment.text}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted text-sm" style={{ textAlign: 'center', marginTop: '40px' }}>No comments yet. Start the discussion!</div>
                  )}
                </div>
                
                <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" className="input-field" placeholder="Type a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} required />
                  <button type="submit" className="btn-primary">Post</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GENERIC MODAL FOR CAMPAIGNS, LEADS, SOCIAL */}
      {showGenericModal && selectedEvent && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2>{selectedEvent.title}</h2>
              <button className="action-btn" onClick={() => setShowGenericModal(false)}><X size={24} /></button>
            </div>
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <p><strong>Type:</strong> <span className="badge badge-outline">{selectedEvent.type}</span></p>
              <p style={{ marginTop: '12px' }}><strong>Date:</strong> {selectedEvent.start.toLocaleString()}</p>
              {selectedEvent.type === 'Campaign' && <p style={{ marginTop: '12px' }}><strong>Status:</strong> {selectedEvent.resource.status}</p>}
              {selectedEvent.type === 'Follow-up' && <p style={{ marginTop: '12px' }}><strong>Lead Source:</strong> {selectedEvent.resource.source}</p>}
              {selectedEvent.type === 'Social Post' && <p style={{ marginTop: '12px' }}><strong>Platforms:</strong> {selectedEvent.resource.platforms.join(', ')}</p>}
            </div>
            <div className="modal-actions" style={{ marginTop: '24px' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowGenericModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCalendar;

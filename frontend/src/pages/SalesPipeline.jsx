import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, DollarSign, User } from 'lucide-react';
import { getDeals, updateDeal, createDeal } from '../services/dealService';
import './SalesPipeline.css';

const STAGES = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

const SalesPipeline = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', value: 0, stage: 'Prospecting', leadId: '' });

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const data = await getDeals();
      setDeals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      const updatedStage = destination.droppableId;
      // Optimistic UI update
      setDeals(deals.map(deal => 
        deal._id === draggableId ? { ...deal, stage: updatedStage } : deal
      ));

      try {
        await updateDeal(draggableId, { stage: updatedStage });
      } catch (err) {
        console.error(err);
        fetchDeals(); // Revert on failure
      }
    }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = { ...formData };
      if (!dataToSubmit.leadId) {
        delete dataToSubmit.leadId;
      }
      await createDeal(dataToSubmit);
      setShowModal(false);
      setFormData({ title: '', value: 0, stage: 'Prospecting', leadId: '' });
      fetchDeals();
    } catch (err) {
      console.error(err);
    }
  };

  // Group deals by stage
  const columns = STAGES.reduce((acc, stage) => {
    acc[stage] = deals.filter(deal => deal.stage === stage);
    return acc;
  }, {});

  return (
    <div className="page-content pipeline-page">
      <div className="page-header">
        <div>
          <h1>Sales Pipeline</h1>
          <p>Drag and drop deals to update their stages.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Deal
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading pipeline...</div>
      ) : (
        <div className="pipeline-board">
          <DragDropContext onDragEnd={onDragEnd}>
            {STAGES.map(stage => (
              <div className="pipeline-column" key={stage}>
                <div className="column-header">
                  <h3>{stage}</h3>
                  <span className="deal-count">{columns[stage].length}</span>
                </div>
                <Droppable droppableId={stage}>
                  {(provided, snapshot) => (
                    <div
                      className={`droppable-area ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {columns[stage].map((deal, index) => (
                        <Draggable key={deal._id} draggableId={deal._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              className={`deal-card ${snapshot.isDragging ? 'is-dragging' : ''}`}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <div className="deal-title">{deal.title}</div>
                              <div className="deal-value"><DollarSign size={14}/> {deal.value?.toLocaleString()}</div>
                              {deal.leadId && <div className="deal-lead"><User size={12}/> {deal.leadId.name}</div>}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </DragDropContext>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <h2>Add Deal</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input type="text" name="title" className="input-field" value={formData.title} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Value ($)</label>
                <input type="number" name="value" className="input-field" value={formData.value} onChange={handleInputChange} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Deal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesPipeline;

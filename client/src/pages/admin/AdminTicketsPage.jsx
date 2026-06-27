import { useState, useEffect } from 'react';
import { MessageCircle, Send, Clock, Filter, ChevronDown } from 'lucide-react';
import { adminAPI } from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import Input, { Select, Textarea } from '../../components/Input';

export default function AdminTicketsPage() {
  const { addToast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState('in_progress');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const statusFilter = filter === 'all' ? null : filter;
      const res = await adminAPI.getTickets(statusFilter, 50, 0);
      setTickets(res.data.tickets);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      addToast('Failed to load tickets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!reply.trim()) {
      addToast('Please enter a reply', 'error');
      return;
    }

    setSending(true);
    try {
      await adminAPI.replyTicket(selectedTicket.id, reply, status);
      addToast('Reply sent successfully', 'success');
      setReply('');
      fetchTickets();
      setSelectedTicket(null);
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to send reply', 'error');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      open: 'bg-amber-50 text-amber-600 border-amber-200',
      in_progress: 'bg-blue-50 text-blue-600 border-blue-200',
      resolved: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      closed: 'bg-gray-100 text-gray-600 border-gray-200'
    };
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>
        {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-amber-50 text-amber-600',
      high: 'bg-rose-50 text-rose-600'
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[priority]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const openTicketsCount = tickets.filter(t => t.status === 'open').length;

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
          <p className="text-gray-400 mt-1">
            {openTicketsCount > 0 ? `${openTicketsCount} open ticket${openTicketsCount > 1 ? 's' : ''}` : 'All tickets resolved'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-dark-700 rounded-2xl border border-dark-600 p-8 text-center text-gray-400">
            <div className="animate-pulse">Loading tickets...</div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-dark-700 rounded-2xl border border-dark-600 p-8 text-center">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-500" />
            <p className="text-gray-400">No tickets found</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div 
              key={ticket.id} 
              className="bg-dark-700 rounded-2xl border border-dark-600 overflow-hidden hover:border-dark-500 transition-colors"
            >
              <button
                onClick={() => setSelectedTicket(ticket)}
                className="w-full p-6 text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-primary-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{ticket.subject}</h3>
                        {getPriorityBadge(ticket.priority)}
                      </div>
                      <p className="text-gray-400 text-sm mb-2">
                        From: {ticket.user_name} ({ticket.user_email})
                      </p>
                      <p className="text-gray-500 text-sm line-clamp-2">
                        {ticket.message}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {getStatusBadge(ticket.status)}
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDate(ticket.created_at)}
                  </span>
                </div>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Ticket Detail Modal */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => { setSelectedTicket(null); setReply(''); }}
        title="Ticket Details"
        size="lg"
      >
        {selectedTicket && (
          <div className="space-y-6">
            {/* Ticket Info */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getPriorityBadge(selectedTicket.priority)}
                  {getStatusBadge(selectedTicket.status)}
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(selectedTicket.created_at)}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedTicket.subject}</h3>
              <p className="text-gray-600">{selectedTicket.message}</p>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Submitted by <span className="font-medium text-gray-700">{selectedTicket.user_name}</span> ({selectedTicket.user_email})
                </p>
              </div>
            </div>

            {/* Previous Admin Reply */}
            {selectedTicket.admin_reply && (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm font-medium text-blue-600 mb-2">Previous Reply:</p>
                <p className="text-gray-700">{selectedTicket.admin_reply}</p>
              </div>
            )}

            {/* Reply Form */}
            <div className="space-y-4">
              <Textarea
                label="Your Reply"
                placeholder="Type your response to this ticket..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              
              <Select
                label="Update Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </Select>

              <Button
                onClick={handleReply}
                loading={sending}
                className="w-full"
              >
                <Send className="w-4 h-4" />
                Send Reply
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

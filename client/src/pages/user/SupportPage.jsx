import { useState, useEffect } from 'react';
import { MessageCircle, Send, Clock, ChevronDown, ChevronUp, Mail, Phone, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { supportAPI } from '../../utils/api';
import Button from '../../components/Button';
import Input, { Select, Textarea } from '../../components/Input';
import { Card, CardHeader, CardContent } from '../../components/Card';

export default function SupportPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await supportAPI.getTickets(20, 0);
      setTickets(res.data.tickets);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject.trim()) {
      addToast('Please enter a subject', 'error');
      return;
    }
    if (!message.trim() || message.length < 10) {
      addToast('Please enter a message (at least 10 characters)', 'error');
      return;
    }

    setLoading(true);
    try {
      await supportAPI.createTicket({ subject, message, priority });
      addToast('Support ticket submitted successfully', 'success');
      setSubject('');
      setMessage('');
      setPriority('medium');
      fetchTickets();
    } catch (error) {
      addToast(error.response?.data?.error || 'Failed to submit ticket', 'error');
    } finally {
      setLoading(false);
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
      open: 'bg-amber-50 text-amber-600',
      in_progress: 'bg-blue-50 text-blue-600',
      resolved: 'bg-emerald-50 text-emerald-600',
      closed: 'bg-gray-100 text-gray-600'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.open}`}>
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
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[priority]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const faqs = [
    {
      question: 'How long does withdrawal take?',
      answer: 'Bank transfers typically take 2-5 business days, while cryptocurrency withdrawals are usually processed within 24 hours.'
    },
    {
      question: 'What is the minimum withdrawal amount?',
      answer: 'The minimum withdrawal amount is $10.00 USD.'
    },
    {
      question: 'Why is my account frozen?',
      answer: 'Your account may be frozen due to security concerns, unusual activity, or verification requirements. Please contact support for assistance.'
    },
    {
      question: 'How can I reset my password?',
      answer: 'Click on "Forgot Password" on the login page and follow the instructions sent to your email.'
    },
    {
      question: 'Is my information secure?',
      answer: 'Yes, we use industry-standard encryption and security measures to protect your personal and financial information.'
    }
  ];

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Support Center</h1>
        <p className="text-gray-500 mt-1">Get help from our support team</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Submit a Ticket</h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Subject"
                  placeholder="Brief description of your issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />

                <Textarea
                  label="Message"
                  placeholder="Please describe your issue in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />

                <Select
                  label="Priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="low">Low - General inquiry</option>
                  <option value="medium">Medium - Issue affecting usage</option>
                  <option value="high">High - Urgent issue</option>
                </Select>

                <Button type="submit" loading={loading} className="w-full">
                  <Send className="w-4 h-4" />
                  Submit Ticket
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Previous Tickets */}
          <Card className="mt-8">
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Your Tickets</h2>
            </CardHeader>
            <CardContent className="p-0">
              {ticketsLoading ? (
                <div className="p-6 text-center text-gray-500">
                  <div className="animate-pulse">Loading tickets...</div>
                </div>
              ) : tickets.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No support tickets yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {tickets.map((ticket) => (
                    <div key={ticket.id}>
                      <button
                        onClick={() => setExpandedTicket(expandedTicket === ticket.id ? null : ticket.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                            <MessageCircle className="w-5 h-5 text-primary-600" />
                          </div>
                          <div className="text-left">
                            <p className="font-medium text-gray-900">{ticket.subject}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {getPriorityBadge(ticket.priority)}
                              {getStatusBadge(ticket.status)}
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(ticket.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        {expandedTicket === ticket.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      {expandedTicket === ticket.id && (
                        <div className="px-4 pb-4">
                          <div className="p-4 bg-gray-50 rounded-xl ml-14">
                            <p className="text-gray-700 mb-4">{ticket.message}</p>
                            {ticket.admin_reply && (
                              <div className="border-t border-gray-200 pt-4">
                                <p className="text-sm font-medium text-gray-900 mb-1">Support Response:</p>
                                <p className="text-gray-600">{ticket.admin_reply}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* FAQ */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-primary-600" />
                FAQ
              </h3>
            </CardHeader>
            <CardContent className="p-0">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-100 last:border-b-0">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-900 text-left">{faq.question}</span>
                    {openFaq === index ? (
                      <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="px-4 pb-4">
                      <p className="text-sm text-gray-600">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900">Contact Us</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">support@payout.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">+1 (555) 123-4567</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

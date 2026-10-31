import Lead from '../models/Lead.js';

// @desc    Create / Submit a new Lead from Contact Form
// @route   POST /api/leads
// @access  Public
export const createLead = async (req, res) => {
  try {
    const { name, email, phone, company, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required fields',
      });
    }

    const lead = await Lead.create({
      name,
      email,
      phone: phone || '',
      company: company || '',
      subject: subject || 'General Inquiry',
      message,
      source: 'contact_page',
    });

    console.log(`[New Lead Received] From: ${name} (${email}) | Subject: ${subject}`);

    res.status(201).json({
      success: true,
      message: 'Your inquiry has been received! Our expedition marshals will contact you soon.',
      lead: {
        id: lead._id,
        name: lead.name,
        createdAt: lead.createdAt,
      },
    });
  } catch (error) {
    console.error('[CreateLead Error]:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing inquiry',
    });
  }
};

// @desc    Get All Leads for Admin
// @route   GET /api/leads
// @access  Protected (Admin only)
export const getLeads = async (req, res) => {
  try {
    const { status, search } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }

    const leads = await Lead.find(query).sort({ createdAt: -1 });

    // Quick Stats
    const totalCount = await Lead.countDocuments();
    const newCount = await Lead.countDocuments({ status: 'new' });
    const contactedCount = await Lead.countDocuments({ status: 'contacted' });
    const convertedCount = await Lead.countDocuments({ status: 'converted' });

    res.status(200).json({
      success: true,
      count: leads.length,
      stats: {
        total: totalCount,
        new: newCount,
        contacted: contactedCount,
        converted: convertedCount,
      },
      leads,
    });
  } catch (error) {
    console.error('[GetLeads Error]:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching leads',
    });
  }
};

// @desc    Update Lead Status
// @route   PUT /api/leads/:id/status
// @access  Protected (Admin only)
export const updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['new', 'contacted', 'converted', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value',
      });
    }

    const lead = await Lead.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    res.status(200).json({
      success: true,
      message: `Lead status updated to ${status}`,
      lead,
    });
  } catch (error) {
    console.error('[UpdateLeadStatus Error]:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating lead status',
    });
  }
};

// @desc    Delete a Lead
// @route   DELETE /api/leads/:id
// @access  Protected (Admin only)
export const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    const lead = await Lead.findByIdAndDelete(id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    console.error('[DeleteLead Error]:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting lead',
    });
  }
};

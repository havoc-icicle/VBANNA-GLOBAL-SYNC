import { supabase } from '../config/database.js';
import logger from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const { orderId, documentType } = req.body;
    const userId = req.user.id;

    if (!orderId || !documentType) {
      return res.status(400).json({ error: 'Order ID and document type are required.' });
    }

    const fileName = `${userId}/${orderId}/${uuidv4()}-${req.file.originalname}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Create record in documents table
    const { data: dbData, error: dbError } = await supabase
      .from('documents')
      .insert({
        order_id: orderId,
        uploaded_by: userId,
        file_name: fileName,
        original_file_name: req.file.originalname,
        file_path: uploadData.path,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        document_type: documentType,
      })
      .select()
      .single();

    if (dbError) {
      throw dbError;
    }

    logger.info(`Document uploaded: ${fileName} by user ${userId}`);
    res.status(201).json({ message: 'Document uploaded successfully', document: dbData });
  } catch (error) {
    logger.error('Document upload error:', error);
    res.status(500).json({ error: 'Failed to upload document.' });
  }
};

const getDocumentsByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = supabase.from('documents').select('*').eq('order_id', orderId);

    // Non-admins can only see their own documents
    if (userRole !== 'Admin') {
      query = query.eq('uploaded_by', userId);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ documents: data });
  } catch (error) {
    logger.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to retrieve documents.' });
  }
};

const downloadDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const { data: doc, error: docError } = await supabase
            .from('documents')
            .select('*')
            .eq('id', id)
            .single();

        if (docError || !doc) {
            return res.status(404).json({ error: 'Document not found.' });
        }

        // Authorization check
        if (userRole !== 'Admin' && doc.uploaded_by !== userId) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        const { data, error } = await supabase.storage
            .from('documents')
            .download(doc.file_name);

        if (error) {
            throw error;
        }

        res.setHeader('Content-Type', doc.mime_type);
        res.setHeader('Content-Disposition', `attachment; filename="${doc.original_file_name}"`);
        res.send(Buffer.from(await data.arrayBuffer()));

    } catch (error) {
        logger.error('Download document error:', error);
        res.status(500).json({ error: 'Failed to download document.' });
    }
};

const updateDocumentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;
        const adminId = req.user.id;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid document status.' });
        }

        const { data: document, error: docError } = await supabase
            .from('documents')
            .select('*')
            .eq('id', id)
            .single();

        if (docError || !document) {
            return res.status(404).json({ error: 'Document not found.' });
        }

        const updateData = {
            status: status,
            approved_by: adminId,
            approved_at: new Date().toISOString(),
            rejection_reason: status === 'rejected' ? rejectionReason : null,
        };

        const { data: updatedDoc, error: updateError } = await supabase
            .from('documents')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            throw updateError;
        }

        logger.info(`Document ${id} status updated to ${status} by admin ${adminId}`);
        res.json({ message: 'Document status updated successfully', document: updatedDoc });

    } catch (error) {
        logger.error('Update document status error:', error);
        res.status(500).json({ error: 'Failed to update document status.' });
    }
};

export { uploadDocument, getDocumentsByOrder, downloadDocument, updateDocumentStatus };

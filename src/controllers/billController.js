const Bill = require('../models/Bill');
const PaidBill = require('../models/PaidBill');
const { uploadFileToBucket } = require('../services/gcpFileUploadService');


const billController = {
    getAllBills: async (req, res) => {
        try {          
            const bills = await Bill.findAll();
            return res.status(200).json({ bills });
        } catch (error) {
            return res.status(500).json({ message: 'Failed to retrieve users', error: error.message });
        }
    },

    createBill: async (req, res) => {
        try {
            const { name, description, bill_amount, amount_received} = req.body;
            if(!name || !description || !bill_amount || !req.file) {
                return res.status(400).json({ message: 'Name, description, and bill amount are required' });
            }
            if (isNaN(bill_amount) || parseFloat(bill_amount) <= 0) {
                return res.status(400).json({ message: 'Bill amount must be a positive number' });
            }
            if (amount_received && (isNaN(amount_received) || parseFloat(amount_received) <= 0)) {
                return res.status(400).json({ message: 'Amount received must be a positive number' });
            }
            let imageUrl = null;
            if (req.file) {
                //TODO: HANDLE ACTUAL UPLOAD TO GCP AND GET URL WHEN BUCKET IS SET UP
                // imageUrl = await uploadFileToBucket(req.file, 'bills'); 
                imageUrl = `https://fakeurl.com/${req.file.filename}`; // Placeholder URL
            }
            if (amount_received) {
                // create bill then mark as paid(if fully paid), also create payment record in paid_bills table
                // Check if full amount is received then mark bill as paid
                if(req.user.userType.access_level < 2) {
                    return res.status(403).json({ message: 'Insufficient permissions to create a paid bill' });
                }
                const paid = parseFloat(amount_received) >= parseFloat(bill_amount); //if fully paid
                const newBill = await Bill.create({ name, bill_amount, description, invoice_pdf_url: imageUrl, added_by: req.user.id, paid});
                const paidBill = await PaidBill.create({ name, description, bill_id: newBill.id, added_by: req.user.id, payment_invoice_url: imageUrl, amount_received });
                return res.status(201).json({ message: 'Bill created and marked as paid successfully', bill: newBill, paidBill });

            }
            const newBill = await Bill.create({ name, bill_amount, description, invoice_pdf_url: imageUrl, added_by: req.user.id });
            return res.status(201).json({ message: 'Bill created successfully', bill: newBill });
        } catch (error) {
            return res.status(500).json({ message: 'Failed to create bill', error: error.message });
        }
    },

    updateBill: async (req, res) => { 
        try {
            const { id } = req.params;
            const { name, description, bill_amount, amount_received } = req.body;
             if(!name || !description || !bill_amount || !req.file) {
                return res.status(400).json({ message: 'Name, description, and bill amount are required' });
            }
            if (isNaN(bill_amount) || parseFloat(bill_amount) <= 0) {
                return res.status(400).json({ message: 'Bill amount must be a positive number' });
            }
            if (amount_received && (isNaN(amount_received) || parseFloat(amount_received) <= 0)) {
                return res.status(400).json({ message: 'Amount received must be a positive number' });
            }
            let imageUrl = null;
            if (req.file) {
                //TODO: HANDLE ACTUAL UPLOAD TO GCP AND GET URL WHEN BUCKET IS SET UP
                // imageUrl = await uploadFileToBucket(req.file, 'bills'); 
                imageUrl = `https://fakeurl.com/${req.file.filename}`; // Placeholder URL
            }
            const bill = await Bill.findByPk(id);
            if (!bill) {
                return res.status(404).json({ message: 'Bill not found' });
            }
            //old payment records for same bill
            const paymentsAgainstBill = await PaidBill.findAll({ where: { bill_id: id } });
            let totalAmountReceived = 0; // Sum of previous payments
            const amountPaidBefore = paymentsAgainstBill.reduce((sum, payment) => sum + parseFloat(payment.amount_received), 0);
            totalAmountReceived += amountPaidBefore;
            totalAmountReceived += amount_received ? parseFloat(amount_received) : 0;
            //TODO -- Maybe add a paid till now field to bills table to track partial payments instead of calculating every time from paid_bills table
            const recordPayment = await PaidBill.create({ name, description, bill_id: id, added_by: req.user.id, payment_invoice_url: imageUrl, amount_received: amount_received ? parseFloat(amount_received) : 0 });
            const paidFull = parseFloat(totalAmountReceived) >= parseFloat(bill_amount);
            if (paidFull) {
                await bill.update({ paid: paidFull });
            }
            return res.status(200).json({ message: 'Bill payment recorded successfully', bill, recordPayment });
        } catch (error) {
            
        }
    }
};

module.exports = { billController };

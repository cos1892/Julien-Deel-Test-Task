const {getContractById, getContracts} = require('../controllers/contracts');
const {getUnpaidJobs, payJob} = require('../controllers/jobs');
const {makeDeposit} = require('../controllers/balances');
const {fetchBestProfessions, fetchBestClients} = require('../controllers/admin');

module.exports = (app) => {
    /**
     * Expect profile_id in header
     * @returns contract by id
     */
    app.get('/contracts/:id', getContractById);

    /**
     * Expect profile_id in header
     * @returns contracts list
     */
    app.get('/contracts', getContracts);

    /**
     * Expect profile_id in header
     * @returns jobs list
     */
    app.get('/jobs/unpaid', getUnpaidJobs);

    /**
     * Expect profile_id in header
     * @returns payment result
     */
    app.post('/jobs/:job_id/pay', payJob);

    /**
     * Expect profile_id in header
     * @returns deposit result
     */
    app.post('/balances/deposit/:userId', makeDeposit);

    /**
     * Expect start and end dates query params
     * @returns best profession
     */
    app.get('/admin/best-profession', fetchBestProfessions);

    /**
     * Expect start and end dates and limit query params
     * @returns best profession
     */
    app.get('/admin/best-clients', fetchBestClients);
}

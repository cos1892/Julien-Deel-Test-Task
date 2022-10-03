const {Op} = require('sequelize');
const {generateErrorResponse} = require('../managers/error-manager');

const fetchBestProfessions = async (req, res) => {
    const {Contract, Profile, Job} = req.app.get('models');
    const sequelize = req.app.get('sequelize');
    const {start, end} = req.query;
    const minDate = new Date(-8640000000000000);
    const maxDate = new Date(8640000000000000);
    const startDate = start ? new Date(start) : minDate;
    const endDate = end ? new Date(end) : maxDate;
    
    try {
        const bestProfession = await Job.findAll({
            group: 'Contract.Contractor.profession',
            attributes: [
                'Contract.Contractor.profession',
                [sequelize.fn('SUM', sequelize.col('price')), 'totalAmount']
            ],
            where: {
                paid: true,
                paymentDate: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: {
                attributes: ['contractorId'],
                model: Contract,
                include: {
                    attributes: ['profession'],
                    model: Profile,
                    as: 'Contractor',
                    where: {
                        type: 'contractor'
                    }
                }
            },
            order: sequelize.literal('totalAmount DESC'),
            limit: 1,
            raw: true
        });

        if(!bestProfession || !bestProfession[0]) return res.status(404).end();
    
        res.status(200).json(bestProfession[0].profession);
    } catch(ex) {
        const error = generateErrorResponse(ex.message);
        return res.status(error.status).json({
            success: false,
            message: error.message
        });
    }
};

const fetchBestClients = async (req, res) => {
    const {Contract, Profile, Job} = req.app.get('models');
    const sequelize = req.app.get('sequelize');
    const {start, end, limit} = req.query;
    const defaultLimit = 2;
    const minDate = new Date(-8640000000000000);
    const maxDate = new Date(8640000000000000);
    const startDate = start ? new Date(start) : minDate;
    const endDate = end ? new Date(end) : maxDate;
    const queryLimit = parseInt(limit, 10) || defaultLimit;
    
    try {
        const bestClients = await Job.findAll({
            group: 'Contract.Client.id',
            attributes: [
                [sequelize.col('Contract.Client.id'), 'id'],
                [sequelize.literal(`firstName  || ' ' || lastName`), 'fullName'],
                [sequelize.fn('SUM', sequelize.col('price')), 'totalPaid']
            ],
            where: {
                paid: true,
                paymentDate: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: {
                attributes: [],
                model: Contract,
                include: {
                    model: Profile,
                    as: 'Client',
                    where: {
                        type: 'client'
                    }
                }
            },
            order: sequelize.literal('totalPaid DESC'),
            limit: queryLimit
        });

        if(!bestClients) return res.status(404).end();
    
        res.status(200).json(bestClients);
    } catch(ex) {
        const error = generateErrorResponse(ex.message);
        return res.status(error.status).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    fetchBestProfessions,
    fetchBestClients
}
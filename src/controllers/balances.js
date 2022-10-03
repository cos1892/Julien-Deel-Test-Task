const {Op, Transaction, } = require('sequelize');
const {generateErrorResponse} = require('../managers/error-manager');

const makeDeposit = async (req, res) =>{
    const profile = req.profile;
    const profileId = profile.id;
    const {userId} = req.params;
    const amount = req.body.amount;
    const DEPOSIT_LIMIT_RATE = 0.25;

    if(profileId !== parseInt(userId, 10)) {
        console.error('makeDeposit', `User try to deposit another account profile ID: ${profileId}, userId: ${userId}`);
        return res.status(401).end();
    }

    if(profile.type !== 'client') {
        console.error('makeDeposit', `User is not a client, profile ID: ${profileId}`);
        return res.status(401).end();
    }
    const {Profile, Contract, Job} = req.app.get('models');
    const sequelize = req.app.get('sequelize');
    try {
        if(amount <= 0) throw new Error('INVALID_DEPOSIT_AMOUNT');

        await sequelize.transaction({
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        }, async () => {
            const unpaidJobs = await Contract.findAndCountAll({
                attributes: [
                    [sequelize.fn('SUM', sequelize.col('Jobs.price')), 'totalUnpaidPrice']
                ],
                where: {
                    ClientId: profileId
                },
                include: {
                    model: Job,
                    attributes: [],
                    as: 'Jobs',
                    where: {
                        paid: {[Op.not]: true}
                    }
                }
            });
            if(unpaidJobs.count === 0) throw new Error('NO_UNPAID_JOBS');
            const parsedUnpaidJobsRowObj = unpaidJobs.rows[0].toJSON();
            const totalUnpaidPrice = parsedUnpaidJobsRowObj.totalUnpaidPrice;

            if(amount > (totalUnpaidPrice * DEPOSIT_LIMIT_RATE)) throw new Error('INVALID_DEPOSIT_AMOUNT');

            // Add amount to User balance
            await Profile.increment({
                balance: amount
            }, {
                where: {
                    id: profileId
                }
            });
        });

        return res.status(200).json({
            success: true
        });
    } catch(ex) {
        console.error('makeDeposit', `The next error ocured for profile Id: ${profileId}, user Id: ${userId} Error: ${ex.message}`);
        const error = generateErrorResponse(ex.message);
        return res.status(error.status).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    makeDeposit
}
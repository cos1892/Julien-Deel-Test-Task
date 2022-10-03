const {Op, Transaction} = require('sequelize');
const {generateErrorResponse} = require('../managers/error-manager');

const getUnpaidJobs = async (req, res) =>{
    const profileId = req.profile.id;
    const {Contract, Job} = req.app.get('models');
    const jobs = await Job.findAll({
        where: {
            paid: { [Op.not]: true }
        },
        include: {
            model: Contract,
            attributes: [],
            where: {
                [Op.and]: [
                    {
                        status: 'in_progress'
                    },
                    {
                        [Op.or]: [
                            {
                                ContractorId: profileId,
                            },
                            {
                                ClientId: profileId,
                            }
                        ]
                    }
                ]
            }
        }
    });
    if(jobs.length === 0) return res.status(404).end();
    return res.json(jobs);
};

const payJob = async (req, res) =>{
    const profile = req.profile;
    if(profile.type !== 'client') {
        console.error('payJob', `User is not a client, profile ID: ${profileId}`);
        return res.status(401).end();
    }
    const {job_id} = req.params;
    const profileId = profile.id;
    const {Profile, Contract, Job} = req.app.get('models');
    const sequelize = req.app.get('sequelize');
    try {
        await sequelize.transaction({
            isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE
        }, async () => {
            const contract = await Contract.findOne({
                where: {
                    ClientId: profileId
                },
                include: {
                    model: Job,
                    where: {
                        id: job_id
                    }
                }
            });
            if(!contract || !contract.Jobs[0]) throw new Error('INVALID_JOB_ID');
            const job = contract.Jobs[0];
            if(job.paid) throw new Error('JOB_PAID');

            if(profile.balance < job.price) throw new Error('INSUFFICIENT_FUNDS');

            // Take amount from Client balance
            await Profile.increment({
                balance: -job.price
            }, {
                where: {
                    id: profileId
                }
            });

            // Add amount to Contractor balance
            await Profile.increment({
                balance: job.price
            }, {
                where: {
                    id: contract.ContractorId
                }
            });

            // Update Job status
            await Job.update({
                paid: true,
                paymentDate: Date.now()
            }, {
                where: {
                    id: job_id
                }
            });
        });

        return res.status(200).json({
            success: true
        });
    } catch(ex) {
        console.error('payJob', `The next error ocured for profile Id: ${profileId}, job Id: ${job_id} Error: ${ex.message}`);
        const error = generateErrorResponse(ex.message);
        return res.status(error.status).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getUnpaidJobs,
    payJob
}
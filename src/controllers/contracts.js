const {Op} = require('sequelize');

const getContractById = async (req, res) =>{
    const profileId = req.profile.id;
    const {Contract} = req.app.get('models');
    const {id} = req.params;
    const contract = await Contract.findOne({where: {id: id}});
    if(!contract) return res.status(404).end();
    if(![contract.ClientId, contract.ContractorId].includes(profileId)) {
        console.error('getContractById', `User try to get contract info that not belongs to it. Profile Id: ${profile.id}, Contract Id: ${contract.id}`);
        return res.status(404).end();
    }
    return res.json(contract);
};

const getContracts = async (req, res) =>{
    const profileId = req.profile.id;
    const {Contract} = req.app.get('models');
    const contracts = await Contract.findAll({where: {
        [Op.and]: [
            {
                status: { [Op.ne]: 'terminated' }
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
    }});
    if(contracts.length === 0) return res.status(404).end();
    return res.json(contracts);
};

module.exports = {
    getContractById,
    getContracts
}
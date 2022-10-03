
const getProfile = async (req, res, next) => {
    const {Profile} = req.app.get('models');
    const profile = await Profile.findOne({where: {id: req.get('profile_id') || 0}});
    if(!profile) {
        console.error('getProfile', `Unauthorised customer trying to reach: ${req.url}`);
        return res.status(401).end()
    }
    req.profile = profile;
    next();
}
module.exports = {
    getProfile
}
const Sauces = require('../models/Sauces')

exports.getAllSauces = (req, res, next) => {
    Sauces.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({error}));
};

exports.getOneSauces = (req, res, next) => {
    Sauces.findOne({_id: req.params.id})
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({error}));
};

exports.createSauces = (req, res, next) => {
    const SaucesObject = JSON.parse(req.body.sauce)
    delete SaucesObject._id;
    delete SaucesObject._userId;
    const sauce = new Sauces({
        ...SaucesObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
    .then(() => { res.status(201).json({message: 'Sauce ajoutée !'})})
    .catch(error => { res.status(400).json( { error })})
};

exports.modifySauces = (req, res, next) => {

};

exports.deleteSauces = (req, res, next) => {

};

exports.addLike = (req, res, next) => {

};
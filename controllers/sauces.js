const Sauces = require('../models/Sauces');
const fs = require('fs');

exports.getAllSauces = (req, res, next) => {
    Sauces.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({error}));
};

exports.getOneSauce = (req, res, next) => {
    Sauces.findOne({_id: req.params.id})
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({error}));
};

exports.createSauce = (req, res, next) => {
    const SaucesObject = JSON.parse(req.body.sauce)
    const init = {
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: [],
    };
    delete SaucesObject._userId;
    const sauce = new Sauces({
        ...SaucesObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        ...init,
    });
    sauce.save()
    .then(() => { res.status(201).json({message: 'Sauce ajoutée !'})})
    .catch(error => { res.status(400).json( { error })})
};

exports.modifySauce = (req, res, next) => {
    const SaucesObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    delete SaucesObject._userId;
    Sauces.findOne({_id: req.params.id})
        .then((sauces) => {
            if (sauces.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
                Sauces.updateOne({ _id: req.params.id}, { ...SaucesObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Sauce modifiée!'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteSauce = (req, res, next) => {
    Sauces.findOne({_id: req.params.id})
    .then(sauces => {
        if (sauces.userId != req.auth.userId) {
            res.status(401).json({ message: "Unauthorized"});
        } else {
            const filename = sauces.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Sauces.deleteOne({_id: req.params.id})
                    .then(() => { res.status(201).json({message: 'Sauce supprimée !'})})
                    .catch(error => { res.status(400).json( { error })})
                });
        }      
    })
    .catch(error => res.status(400).json({error}));
};

exports.addLike = (req, res, next) => {

};
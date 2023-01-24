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

exports.likeSauce = (req, res, next) => {
    Sauces.findOne({_id: req.params.id})
    .then(sauces => {
        let vote;
        let user = req.body.userId;
        let like = sauces.usersLiked.includes(user);
        let dislike = sauces.usersDisliked.includes(user);
        if (like === true) {
            vote = 1;
        } else if (dislike === true) {
            vote = -1
        } else {
            vote = 0;
        }
        if (vote === 0 && req.body.like === 1) {
            sauces.likes += 1;
            sauces.usersLiked.push(user);
        } else if (vote === 1 && req.body.like === 0) {
            sauces.likes -= 1;
            const newUsersLiked = sauces.usersLiked.filter(item => item !== user);
            sauces.usersLiked = newUsersLiked
        } else if (vote === -1 && req.body.like === 0) {
            sauces.dislikes -= 1;
            const newUsersDisliked = sauces.usersDisliked.filter(item => item !== user);
            sauces.usersDisliked = newUsersDisliked
        } else if (vote === 0 && req.body.like === -1) {
            sauces.dislikes += 1;
            sauces.usersDisliked.push(user);
        } else {
            console.log("Like interdit")
        }
        Sauces.updateOne(
            {_id: req.params.id},
            {
                likes: sauces.likes,
                dislikes: sauces.dislikes,
                usersLiked: sauces.usersLiked,
                usersDisliked: sauces.usersDisliked,
            }
        )
        .then(() => { res.status(201).json({message: 'Vote pris en compte !'})})
        .catch(error => { res.status(400).json( { error })})
    })
    .catch((error) => res.status(404).json({ error }));
};
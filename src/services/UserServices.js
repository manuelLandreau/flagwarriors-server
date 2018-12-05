import Mongoose from 'mongoose'
import _ from 'lodash'
import UserModel from '../models/User'
import Bcrypt from 'bcrypt-nodejs'

let config = require('../../config.json')
let User = Mongoose.model('users', UserModel)

export default class UserService {

  /**
   * @param user
   * @returns {*}
   */
  static createToken (user) {
    return jwt.sign(_.omit(user, ['__v', 'password', 'exp', 'iat']), process.env.SECRET || config.SECRET, {expiresIn: 60 * 24 * 30 * 8})
  }

  /**
   * @param req
   * @param res
   * @returns {*}
   */
  static create (req, res) {
    if (!req.body.email || !req.body.pseudo || !req.body.password1 || !req.body.password2) {
      return res.status(400).send({type: 1}) // You must send the email and the password
    }
    if (req.body.password1 != req.body.password2) {
      return res.status(400).send({type: 1}) // You must send the email and the password
    }
    Mongoose.connect(process.env.DB_HOST || config.DB_HOST + process.env.DB_COLLECTION || config.DB_COLLECTION, (err) => {
      if (err) throw err
    })

    User.findOne({email: req.body.email}, (err, user) => {
      if (user)
        return res.status(400).send({type: 2}) // A user with that email already exists
    })

    User.findOne({pseudo: req.body.pseudo}, (err, user) => {
      if (user)
        return res.status(400).send({type: 3}) // A user with that email already exists
    })

    let newUser = new User({
      email: req.body.email,
      pseudo: req.body.pseudo,
      password: Bcrypt.genSalt(10, function (err, salt) {
        if (err)
          return callback(err)

        bcrypt.hash(password, salt, function (err, hash) {
          return callback(err, hash)
        })

      }),
      victories: 1,
      defeats: 1,
      ratio: 1
    })

    newUser.save((err) => {
      if (!err) {
        res.status(201).send({
          id_token: createToken(newUser),
          infos: {
            pseudo: req.body.pseudo,
            email: req.body.email,
            victories: 1,
            defeats: 1
          }
        })
      } else {
        console.log(err)
      }
    })
    Mongoose.connection.close()
  }

  /**
   * @param req
   * @param res
   * @returns {*}
   */
  static login (req, res) {
    if (!req.body.email || !req.body.password) {
      return res.status(400).send({type: 1}) // You must send the email and the password
    }
    Mongoose.connect(process.env.DB_HOST || config.DB_HOST + process.env.DB_COLLECTION || config.DB_COLLECTION, (err) => {
      if (err) throw err
    })

    User.findOne({email: req.body.email}, (err, user) => {
      if (err) throw err
      if (!user) return res.status(401).send({type: 4})// The email or password don\'t match
      Bcrypt.compare(user.password, req.body.password, (err, isPasswordMatch) => {
        if (err)
          throw err
        if (!isPasswordMatch)
          return res.status(401).send({type: 4})
        return res.status(201).send({
          id_token: createToken(user),
          msg: 'Acces Granted',
          infos: {
            pseudo: user.pseudo,
            email: user.email,
            victories: user.victories,
            defeats: user.defeats
          }
        })
      })
    })
    Mongoose.connection.close()
  }

  /**
   * @param req
   * @param res
   */
  static refresh (req, res) {
    jwt.verify(req.body.token, process.env.SECRET || config.SECRET, (err, decoded) => {
      if (decoded !== 'undefined') {
        res.status(201).send({
          id_token: createToken(decoded),
          infos: {
            pseudo: decoded.pseudo,
            email: decoded.email,
            victories: decoded.victories,
            defeats: decoded.defeats
          }
        })
      } else {
        res.status(401).send()
      }
    })
  }

  /**
   * @param req
   * @param res
   */
  static updateRatio (req, res) {
    jwt.verify(req.body.token, process.env.SECRET || config.SECRET, (err, decoded) => {
      if (decoded !== 'undefined') {
        if (decoded.id == req.body.id && req.body.victory) {
          req.body.victories++
          let ratio = req.body.victories / 1 * req.body.defeats
          User.update({_id: req.body.id}, {
            $set: {
              victories: req.body.victories,
              ratio: ratio
            }
          }, (err, user) => {
            if (err) console.log(err)
            res.status(201).send(user)
          })
        }
        if (decoded.id == req.body.id && req.body.defeat) {
          req.body.defeats++
          var ratio = req.body.victories / 1 * req.body.defeats
          User.update({_id: req.body.id}, {
            $set: {
              victories: req.body.defeats,
              ratio: ratio
            }
          }, (err, user) => {
            if (err) console.log(err)
            res.status(201).send(user)
          })
        }
      }
    })
  }

  /**
   * @param req
   * @param res
   */
  static getTop (req, res) {
    let top = []
    User.findOne().sort('-ratio').exec((err, doc) => {
      top.push(doc)
    })
    res.end()
  }
}
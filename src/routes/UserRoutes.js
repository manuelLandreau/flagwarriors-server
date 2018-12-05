import Express from 'express'
import UserService from '../services/UserServices'

const Router = Express.Router()

Router.post('/register', (req, res) => {
  UserService.create(req, res)
})

Router.post('/login', (req, res) => {
  UserService.login(req, res)
})

Router.post('/refresh', (req, res) => {
  UserService.refresh(req, res)
})

export default Router
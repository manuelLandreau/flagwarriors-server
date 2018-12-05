import Express from 'express'
import UserService from '../services/UserServices'

const Router = Express.Router()

Router.get('/get_top', (req, res) => {
  UserService.getTop(req, res)
})

export default Router

import Express from 'express'
import UserService from '../services/UserServices'

const Router = Express.Router()

Router.put('/update_ratio', (req, res) => {
  UserService.updateRatio(req, res)
})

export default Router
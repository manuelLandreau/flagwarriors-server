// Main controller
import Express from 'express'
import Ejwt from 'express-jwt'
import UserRoutes from './routes/UserRoutes'
import PublicRoutes from './routes/PublicRoutes'
import ProtectedRoutes from './routes/ProtectedRoutes'

let config = require('../config.json')

const app = Express()

const jwtCheck = Ejwt({
  secret: process.env.SECRET || config.SECRET
})

// User routes
app.use('/', UserRoutes)

// Publics routes
app.use('/public', PublicRoutes)

// Protected routes
app.use('/protected', jwtCheck, ProtectedRoutes)

export default app
//librerias y modulos
import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import swaggerUI from "swagger-ui-express"
import { apiSpec } from './swagger/swagger.js'
import { orm, syncSchema } from './shared/db/orm.js'
import { RequestContext } from '@mikro-orm/core'
import { guardia_router } from './guardia/guardia.routes.js'
import { actividad_router } from './actividad/actividad.routes.js'
import { sentencia_router } from './sentencia/sentencia.routes.js'
import { celda_router } from './celda/celda.routes.js'
import { sector_router } from './sector/sector.routes.js'
import { administrador_router } from './administrador/administrador.routes.js'
import { condena_router } from './condena/condena.routes.js'
import { recluso_router } from './recluso/recluso.routes.js'
import { turno_router } from './turno/turno.routes.js'
import { actividad_ilegal_router } from './actividad_ilegal/actividad_ilegal.routes.js'
import { verify_router } from './shared/verification_tools/verify.routes.js'

dotenv.config()
const server_port = process.env.server_port

const app = express()
app.use(express.json())
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(apiSpec))

app.use(cors())

app.use((req, res, next) => {
    RequestContext.create(orm.em, next)
})

app.use('/actividades', actividad_router)
app.use('/actividades_ilegales', actividad_ilegal_router)
app.use('/guardias', guardia_router)
app.use('/sentencias', sentencia_router)
app.use('/sectores', sector_router)
app.use('/administradores', administrador_router)
app.use('/reclusos', recluso_router)
app.use('/condenas', condena_router)
app.use('/sectores', sector_router)
app.use('/celdas', celda_router)
app.use('/sectores/turnos', turno_router)
app.use('/verificar_token', verify_router)
app.use('/turnos', turno_router)
app.use((_, res) => {
    return res.status(404).send({ message: 'Resource not found' })
})

//await syncSchema()  // solo en etapas de desarrollo
  
app.listen(server_port, () => {
    console.log(`server correctly running at port: ${server_port}`)
})










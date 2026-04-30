import { Request, Response } from "express"
import { orm } from "../shared/db/orm.js"
import { Sector } from "./sector.entity.js"
import { Sentencia } from "../sentencia/sentencia.entity.js"
import { throw500 } from "../shared/handle_server_side_errors/server_error_handler.js"

const em = orm.em
em.getRepository(Sector)

async function get_all(req:Request, res:Response){
    try{
        res.status(201).json({sectores: await em.find(Sector, {})})
    } catch (error: any) {
        throw500(res)
    }
}

async function get_sector(cod_sector: number) {
    return await em.findOne(Sector, { cod_sector }, {populate: ['celdas', 'turnos.cod_guardia']})
}

async function get_one(req: Request, res: Response){
    try {
        const cod_sector =  Number.parseInt(req.params.cod_sector) 
        const el_sector = await em.findOne(Sector, { cod_sector: cod_sector }, {populate: ['celdas', 'turnos']})
        if(el_sector){
            res.status(201).json({ status: 201, data: el_sector})
        } else {
            res.status(404).json({ status: 404})
        }
    } catch (error: any){
        throw500(res)
    }
}

async function crear_sector(req: Request, res: Response){
    try{
        const la_sector = await em.create(Sentencia, req.body.sanitized_input)
        const sentencia_con_mismo_orden_gravedad_o_nombre = await em.findOne(Sentencia, { nombre: req.body.sanitized_input.nombre})
        if(sentencia_con_mismo_orden_gravedad_o_nombre == null){
            const la_sentencia = await em.create(Sentencia, req.body.sanitized_input)
            await em.flush()
            return res.status(201).json({status: 201, message: 'sentencia creada'})
        } else if(sentencia_con_mismo_orden_gravedad_o_nombre.nombre == req.body.sanitized_input.nombre) {
            return res.status(409).json({status: 410, message: 'nombre concuerda con uno ya en existencia.'})
        }
    } catch (error: any) {
        res.status(500).json({message : error}) 
    }
}

// async function get_sectores_con_sentencia(la_sentencia: Sentencia){
//     const sectores = await em.find(Sector, { sentencias: { cod_sentencia: la_sentencia.cod_sentencia } }, {populate: ['celdas']});
//     console.log(sectores)
//     return sectores
// }

async function get_celdas(req: Request, res: Response){
    try {
        const cod_sector = Number.parseInt(req.params.cod_sector) 
        const el_sector = await em.findOneOrFail(Sector, { cod_sector }, {populate: ['celdas']})
        res.status(201).json({ status: 201, celdas: el_sector.celdas} )
    } catch (error: any){
        res.status(404).json({status: 404 })
    }
}

export { get_all, get_one, get_celdas, get_sector, crear_sector}


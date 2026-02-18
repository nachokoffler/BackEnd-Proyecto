import { Request, Response } from "express"
import { orm } from "../shared/db/orm.js"
import { Sector } from "./sector.entity.js"
import { get_sentencias_especificas } from "../sentencia/sentencia.controller.js"
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
    return await em.findOne(Sector, { cod_sector }, {populate: ['celdas', 'sentencias', 'turnos.cod_guardia']})
}

async function get_one(req: Request, res: Response){
    try {
        const cod_sector =  Number.parseInt(req.params.cod_sector) 
        const el_sector = await em.findOne(Sector, { cod_sector: cod_sector }, {populate: ['celdas', 'sentencias', 'turnos']})
        if(el_sector){
            res.status(201).json({ status: 201, data: el_sector})
        } else {
            res.status(404).json({ status: 404})
        }
    } catch (error: any){
        throw500(res)
    }
}

async function get_sectores_con_sentencia(la_sentencia: Sentencia){
    const sectores = await em.find(Sector, { sentencias: { cod_sentencia: la_sentencia.cod_sentencia } }, {populate: ['celdas']});
    console.log(sectores)
    return sectores
}

async function get_celdas(req: Request, res: Response){
    try {
        const cod_sector = Number.parseInt(req.params.cod_sector) 
        const el_sector = await em.findOneOrFail(Sector, { cod_sector }, {populate: ['celdas']})
        res.status(201).json({ status: 201, celdas: el_sector.celdas} )
    } catch (error: any){
        res.status(404).json({status: 404 })
    }
}

// async function agregar_sentencia_a_sector(req : Request, res : Response){
//     try{
//         const cod_sector =  Number.parseInt(req.body.cod_sector) 
//         const el_sector = await em.findOneOrFail(Sector, { cod_sector }, {populate: ['sentencias']})
//         const las_sentencias = await get_sentencias_especificas(req.body.cod_sentencias)
//         const sentencias_agregadas = await el_sector.agregar_sentencias(las_sentencias, em)
//         res.status(201).json({ status: 201, data: sentencias_agregadas})
//     } catch (error: any) {
//         res.status(404).json({ message: error.message})
//     }
// }

export { get_all, get_one, get_celdas, get_sector, get_sectores_con_sentencia }


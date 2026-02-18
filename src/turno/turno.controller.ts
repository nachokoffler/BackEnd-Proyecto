import { Request, Response, NextFunction } from "express"
import { get_guardia } from "../guardia/guardia.controller.js"
import { get_sector } from "../sector/sector.controller.js"
import { orm } from "../shared/db/orm.js"
import { Turno } from "./turno.entity.js"

const em = orm.em
em.getRepository(Turno)

const turnos_posibles = ['M', 'T', 'N']

async function sanitizar_input_de_turno(req: Request, res: Response, next: NextFunction) {
    req.body.sanitized_input = {
        turno: req.body.turno,
        cod_guardia: req.body.cod_guardia,
        cod_sector: req.body.cod_sector
    }
    console.log(req.body.sanitized_input)

    for (const key of Object.keys(req.body.sanitized_input)) if(req.body.sanitized_input[key] === undefined) return res.status(400).json({ status: 400, message: `Falta el campo ${key}` })

    if(!turnos_posibles.includes(req.body.sanitized_input.turno)) return res.status(400).json({ message: 'el turno ingresado no corresponde ni con la mañana ni con la tarde ni con la noche'})
    
    req.body.sanitized_input.cod_guardia = await get_guardia(req.body.cod_guardia)
    if(req.body.sanitized_input.cod_guardia == null) return res.status(404).json({ message: 'guardia no encontrado'})

    req.body.sanitized_input.cod_sector = await get_sector(Number.parseInt(req.body.cod_sector))
    if(req.body.sanitized_input.cod_sector == null) return res.status(404).json({ message: 'sector no encontrado'})
    
    next()
}

async function get_from_sector(req:Request, res:Response){
    try {
        const cod_sector = Number.parseInt(req.params.cod_sector)       
        let el_sector = await get_sector(cod_sector)
        if(el_sector != null) {
            if(el_sector.turnos.length == 0){
                res.status(409).json({ status: 409 } )
            } else {
                res.status(201).json({ status: 201, turnos: el_sector.turnos} )
            }
        } else {
            res.status(404).json({ status: 404 })
        }
    } catch (error: any){
        res.status(500).json({status: 500})
    }
}

async function add_turno(req:Request, res:Response) {
    try{
        let el_turno = await em.findOne(Turno, { cod_guardia: req.body.sanitized_input.cod_guardia, turno: req.body.sanitized_input.turno })
        if(el_turno == null){
            let nuevo_turno = await em.create(Turno, req.body.sanitized_input)
            await em.flush()
            res.status(201).json({ status: 201, message: 'turno creado'})
        } else {
            res.status(409).json({ status: 409, message: 'guardia ocupado en ese turno.'})
        }
    } catch (error: any) {
        res.status(500).json({ status: 500, message: error.message})
        console.log(error.message)
    }
}

async function end_turno(req:Request, res:Response) {
    try{
        let el_turno = await em.findOne(Turno, { cod_guardia: req.body.sanitized_input.cod_guardia, cod_sector: req.body.sanitized_input.cod_sector, turno: req.body.sanitized_input.turno })
        if(el_turno != null){
            await em.removeAndFlush(el_turno)
            res.status(201).json({ status: 201, message: 'Turno eliminado.'})
        } else {
            res.status(409).json({ status: 409, message: 'Turno inexistente.'})
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message})
    }
}

export { get_from_sector, add_turno, end_turno, sanitizar_input_de_turno }




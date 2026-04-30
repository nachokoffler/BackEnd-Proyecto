import { Request, Response, NextFunction } from "express"
import { orm } from "../shared/db/orm.js"
import { Guardia } from "./guardia.entity.js"
import { validar_incoming_guardia } from "./guardia.schema.js"
import { throw500 } from "../shared/handle_server_side_errors/server_error_handler.js"

const em = orm.em
em.getRepository(Guardia)

async function sanitizar_input_de_guardia(req : Request, res : Response, next: NextFunction){
    let today = new Date()
    req.body.sanitized_input = {
        nombre: req.body.nombre,
        apellido: req.body.apellido, 
        dni: req.body.dni,
        fecha_ini_contrato: today,
        fecha_fin_contrato: null
    }

    for (const key of Object.keys(req.body.sanitized_input)) {
        if (req.body.sanitized_input[key] === undefined) return res.status(400).json({ status: 400, message: `Falta el campo ${key}` });
    }

    const incoming = await validar_incoming_guardia(req.body.sanitized_input)
    if (!incoming.success){
        console.log(incoming.issues)
        return res.status(400).json({message: incoming.issues[0].message})
    }
    req.body.sanitized_input = incoming.output
    next()
}

async function get_all(req: Request, res: Response){
    try{
        const guardias = await em.find(Guardia, {fecha_fin_contrato: null})
        res.status(201).json({ status: 201, data: guardias})
    } catch (error: any) {
        throw500(res)
    }
}

async function get_one(req: Request, res: Response){
    try {
        const dni =  Number.parseInt(req.params.dni)
        const el_guardia = await em.findOne(Guardia, {dni: dni})
        if(el_guardia != null){
            res.status(201).json({ status: 201, data: el_guardia } )
        } else {
            res.status(404).json({ status: 404 })
        }
    } catch (error: any){
        throw500(res)
    }
}

async function get_guardia(cod_guardia: number) { // esta busqueda es por codigo, a diferencia del get_one donde se busca por dni
    const el_guardia = await em.findOne(Guardia, {cod_guardia: cod_guardia, fecha_fin_contrato: null})
    return el_guardia
}

async function get_some(req:Request, res:Response){
    try{
        const guardias = await em.find(Guardia, {
            $or: [
                { nombre: { $like: `%${req.params.nombre}%` } },
                { apellido: { $like: `%${req.params.apellido}%` } },
            ],
            fecha_fin_contrato: null
        });
        res.status(201).json({ status: 201, data: guardias})
    } catch (error: any) {
        res.status(404).json({ status: 404 })
    }
}

async function add(req: Request, res: Response){
    try{
        const dni =  Number.parseInt(req.body.dni)
        const el_guardia = await em.findOne(Guardia, {dni: req.body.sanitized_input.dni})
        if(el_guardia == null){
            const el_guardia = await em.create(Guardia, req.body.sanitized_input) 
            await em.flush()
            res.status(201).json({ status: 201, cod_guardia: el_guardia.cod_guardia})
        } else {
            if(el_guardia.esta_activo()){
                res.status(409).json({status: 409})
            } else {
                const today = new Date();
                el_guardia.fecha_ini_contrato = today
                el_guardia.fecha_fin_contrato = null
                await em.flush()
                res.status(201).json({status: 201, cod_guardia: el_guardia.cod_guardia})
            }
        }
    } catch (error: any) {
        throw500(res)
    }
}

async function finalizar_contrato(req: Request, res: Response){
    try{
        const cod_guardia =  Number.parseInt(req.body.cod_guardia)
        const el_guardia = await em.findOne(Guardia, { cod_guardia: cod_guardia }, {populate: ['turnos']})
        console.log(el_guardia);
        if(el_guardia != null){
            if(el_guardia.fecha_fin_contrato == null){
                el_guardia.fecha_fin_contrato = new Date()
                if(el_guardia.turnos.isInitialized()){
                    await em.remove(el_guardia.turnos.getItems());
                    await em.flush();
                }
                res.status(201).json({status: 201})
            } else {
                res.status(409).json({status: 409})
            }
        } else {
            res.status(404).json({status: 404})
        }
    } catch (error: any) {
        throw500(res)
        console.log(error.message);
    }
}

export { get_all, get_one, add, finalizar_contrato, get_guardia, sanitizar_input_de_guardia, get_some}





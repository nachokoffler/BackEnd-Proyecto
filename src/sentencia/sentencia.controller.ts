import { Request, Response, NextFunction } from "express"
import { orm } from "../shared/db/orm.js"
import { Sentencia } from "./sentencia.entity.js"
import { validar_nueva_sentencia } from "./sentencia.schema.js"

const em = orm.em
em.getRepository(Sentencia)

async function sanitizar_input_de_sentencia(req: Request, res: Response, next: NextFunction){
    req.body.sanitized_input = {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion, 
        duracion_anios: req.body.duracion_anios,
        orden_de_gravedad: req.body.orden_de_gravedad
    }

    for (const key of Object.keys(req.body.sanitized_input)) {
        if (req.body.sanitized_input[key] === undefined) {
            return res.status(400).json({ status: 400, message: `Falta el campo ${key}` });
        }
    }

    const incoming = await validar_nueva_sentencia(req.body.sanitized_input)
    if(!incoming.success){
        return res.status(400).json({status: 400, message: incoming.issues[0].message})
    }
    next()
}

async function get_all(req : Request, res : Response){
    try{
        const sentencias = await em.find(Sentencia, {}, { orderBy: {'cod_sentencia': 'ASC'}})
        if(sentencias.length != null){
            res.status(201).json({ status: 201, data: sentencias})
        } else {
            res.status(404).json({ status: 404})
        }
    } catch (error: any) {
        res.status(404).json({ message: 'error'})
    }
}

 
async function get_one(req: Request, res: Response){
    try {
        const cod_sentencia =  Number.parseInt(req.params.cod_sentencia)
        const la_sentencia = await get_sentencia(cod_sentencia)
        if(la_sentencia != null){
            console.log(la_sentencia)
            res.status(201).json({ data: la_sentencia} ) 
        } else {
            res.status(404).json({ message: 'no encontrada'} )
        }
    } catch (error: any){
        res.status(500).json({ message: error.message})
    }
}

async function add(req: Request, res: Response){
    try{
        const sentencia_con_mismo_orden_gravedad_o_nombre = await em.findOne(Sentencia, { nombre: req.body.sanitized_input.nombre})
        if(sentencia_con_mismo_orden_gravedad_o_nombre == null){
            const la_sentencia = await em.create(Sentencia, req.body.sanitized_input)
            await em.flush()
            return res.status(201).json({status: 201, message: 'sentencia creada'})
        // } else if(sentencia_con_mismo_orden_gravedad_o_nombre.orden_de_gravedad == req.body.sanitized_input.orden_de_gravedad) {
        //     return res.status(409).json({status: 409, message: 'orden de gravedad concuerda con uno ya en existencia.'})
        } else if(sentencia_con_mismo_orden_gravedad_o_nombre.nombre == req.body.sanitized_input.nombre) {
            return res.status(409).json({status: 410, message: 'nombre concuerda con uno ya en existencia.'})
        }
    } catch (error: any) {
        res.status(500).json({message : error}) 
    }
}

async function get_sentencia(cod_sentencia: number){
    return await em.findOne(Sentencia, { cod_sentencia: cod_sentencia })
}

async function get_sentencias_especificas(cod_sentencias: number[]){
    return await em.find(Sentencia, { cod_sentencia: {$in: cod_sentencias} })
}

export { get_all, get_one, add, get_sentencia, get_sentencias_especificas, sanitizar_input_de_sentencia }


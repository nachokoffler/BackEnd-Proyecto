import { Request, Response, NextFunction } from "express"
import { Actividad_Ilegal } from "./actividad_ilegal.entity.js"
import { Recluso } from "../recluso/recluso.entity.js"
import { orm } from "../shared/db/orm.js"
import { validar_nueva_actividad_ilegal } from "./actividad_ilegal.schema.js"
import { throw500 } from "../shared/handle_server_side_errors/server_error_handler.js"

const em = orm.em

async function sanitizar_input_de_actividad_ilegal(req : Request, res : Response, next: NextFunction){
    req.body.sanitized_input = {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        locacion: req.body.locacion,
        dia_de_la_semana: req.body.dia_de_la_semana,
        hora_inicio: req.body.hora_inicio,
        hora_fin: req.body.hora_fin,
        cantidad_maxima: req.body.cantidad_maxima
    }

    for (const key of Object.keys(req.body.sanitized_input)){
        if(req.body.sanitized_input[key] === undefined){
            return res.status(400).json({ status: 400, message: `Falta el campo ${key}` });
        }
    }

    const incoming = await validar_nueva_actividad_ilegal(req.body.sanitized_input)
    if(!incoming.success){
        return res.status(400).json({status: 400, message: incoming.issues[0].message})
    }
    req.body.sanitized_input = incoming.output    
    
    next()
}

async function get_all(req:Request, res:Response){
    try{
        const actividades_ilegales = await em.find(Actividad_Ilegal, {})
        if(actividades_ilegales.length > 0){
            res.status(201).json({ status: 201, ilegales: actividades_ilegales})
        } else {
            res.status(404).json({ status: 404})
        }
    } catch (error: any) {
        throw500(res)
    }
}

async function get_one(req: Request, res: Response){
    try {
        const cod_act_ilegal =  Number.parseInt(req.params.cod_actividad_ilegal)
        const la_act_ilegal = await em.findOne(Actividad_Ilegal, { cod_act_ilegal: cod_act_ilegal }, {populate: ['reclusos']})
        if(la_act_ilegal){
            res.status(201).json({ data: la_act_ilegal, status: 201} )
        } else {
            res.status(404).json({status: 404, message: 'actividad ilegal no encontrada'})
        }
    } catch (error: any){
        throw500(res)
    }
}

async function get_some(req:Request, res:Response){
    try{
        res.status(201).json({ status: 201, data: await em.find(Actividad_Ilegal, { nombre: { $like: `%${req.params.nombre}%` } })})
    } catch (error: any) {
        res.status(404).json({ status: 404 })
    }
}

async function add(req: Request, res: Response){
    try{
        const la_act_ilegal = await em.findOne(Actividad_Ilegal, {dia_de_la_semana: req.body.dia_de_la_semana, hora_inicio: req.body.hora_inicio, hora_fin: req.body.hora_fin })
        if(la_act_ilegal == null){
            const nueva_act_ilegal = em.create(Actividad_Ilegal, req.body)
            await em.flush()
            res.status(201).json({status: 201, message: 'actividad ilegal almacenada'})
        }else{
            res.status(409).json({status: 409, message: 'no se puede crear la actividad ilegal debido a que pisaria a otra'})
        }
    } catch (error: any) {
        throw500(res)
    }
}

async function remove(req: Request, res: Response) {
    try{
        const cod_actividad : any[] = [];
        cod_actividad[0] = Number(req.params.cod_act_ilegal)
        const la_actividad_verdadera = await em.findOne(Actividad_Ilegal, {cod_act_ilegal: cod_actividad[0] })
        if(la_actividad_verdadera == null) {
            res.status(404).json({status: 404, message: 'actividad ilegal no encontrada'})
        } else {
            await em.removeAndFlush(la_actividad_verdadera)
            res.status(201).json({status: 201})
        }
    } catch (error: any) {
        throw500(res)
    }
}

async function inscripcion(req: Request, res: Response) {
    try {
        const cod_actividad_ilegal : any[] = [];
        cod_actividad_ilegal[0] = Number(req.params.cod_act_ilegal)
        const cod_recluso : any[] = [];
        cod_recluso[0] = Number(req.params.cod_recluso)
        const actividad_ilegal = await em.findOne(Actividad_Ilegal, {cod_act_ilegal: cod_actividad_ilegal[0] }, {populate: ['reclusos']})
        const el_recluso_verdadero = await em.findOne(Recluso, cod_recluso[0])
        if(el_recluso_verdadero != null && actividad_ilegal != null){
            if(actividad_ilegal.reclusos.isInitialized()){
                if(actividad_ilegal.reclusos.length < actividad_ilegal.cantidad_maxima){
                    if(!actividad_ilegal.reclusos.contains(el_recluso_verdadero)){
                        actividad_ilegal.reclusos.add(el_recluso_verdadero)
                        await em.flush()
                        res.status(201).json({status: 201, message: 'Inscripcion lograda'})
                    } else {
                        res.status(409).json({status: 409, message: 'El recluso ya inscripto anteriormente'})
                    }
                } else {
                    res.status(409).json({status: 409, message: 'No hay cupo disponible'})
                }
            } else {
                actividad_ilegal.reclusos.add(el_recluso_verdadero)
                await em.flush()
                res.status(201).json({status: 201, message: 'Inscripcion lograda'})
            }
        }
        if(el_recluso_verdadero == null) return res.status(404).json({ status: 404 , message: 'Recluso no encontrado'})
        if(actividad_ilegal == null) return res.status(405).json({ status: 405 , message: 'Actividad ilegal no encontrada'})
    } catch (error: any) {
        throw500(res)
    }
}

export { get_all, get_one, add, inscripcion, sanitizar_input_de_actividad_ilegal, remove, get_some }




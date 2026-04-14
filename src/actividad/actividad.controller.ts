import { Request, Response, NextFunction } from "express"
import { Actividad } from "./actividad.entity.js"
import { orm } from "../shared/db/orm.js"
import { get_sector } from "../sector/sector.controller.js"
import { validar_nueva_actividad } from "./actividad.schema.js"

const em = orm.em

async function sanitizar_input_de_actividad(req : Request, res : Response, next: NextFunction){
    req.body.sanitized_input = {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        locacion: req.body.locacion,
        dia_de_la_semana: req.body.dia_de_la_semana,
        hora_inicio: req.body.hora_inicio,
        hora_fin: req.body.hora_fin,
        estado: true,
        cantidad_minima: req.body.cantidad_minima,
        edad_minima: req.body.edad_minima,
        cod_sector: req.body.cod_sector        
    }
    for (const key of Object.keys(req.body.sanitized_input)) {
        if(req.body.sanitized_input[key] === undefined){
            return res.status(400).json({ status: 400, message: `Falta el campo ${key}`});
        }
    }
    const incoming = await validar_nueva_actividad(req.body.sanitized_input)
    if(!incoming.success){
        return res.status(400).json({status: 400, message: incoming.issues[0].message})
    }
    req.body.sanitized_input = incoming.output

    req.body.sanitized_input.cod_sector = await get_sector(req.body.sanitized_input.cod_sector)
    if(req.body.sanitized_input.cod_sector == null) return res.status(404).json({ message: 'sector invalido'})
    console.log(req.body.sanitized_input)
    next()
}

async function get_all(req:Request, res:Response){
    try {
        res.status(201).json({ message: 'las actividades:', data: await em.find(Actividad, { estado: true }) })
    } catch (error: any) {
        res.status(500).json({ message: error.message})
    }
}

async function get_some(req:Request, res:Response){
    try{
        res.status(201).json({ status: 201, data: await em.find(Actividad, { nombre: { $like: `%${req.params.nombre}%` } })})
    } catch (error: any) {
        res.status(404).json({ status: 404 })
    }
}

async function get_one(req: Request, res: Response){
    try {
        const cod_actividad = Number.parseInt(req.params.cod_actividad)
        res.status(201).json({ data: await em.findOneOrFail(Actividad, { cod_actividad: cod_actividad , estado: true}, { populate: ['reclusos'] }) } )
    } catch (error: any){
        res.status(404).json({ status: 404})
    }
}

async function add(req: Request, res: Response){
    try{
        const actividad = await em.findOne(Actividad, { estado: true , cod_sector: req.body.sanitized_input.cod_sector, dia_de_la_semana: req.body.sanitized_input.dia_de_la_semana, })
        const reclusos_validos = await req.body.sanitized_input.cod_sector.conseguir_reclusos_con_edad(req.body.sanitized_input.edad_minima)
        if(reclusos_validos.length >= req.body.sanitized_input.cantidad_minima && actividad == null){     
            req.body.sanitized_input.reclusos = reclusos_validos                 
            const la_actividad = await em.create(Actividad, req.body.sanitized_input)
            await em.flush()
            res.status(201).json({ status: 201, data: reclusos_validos})
        } else if (reclusos_validos.length < req.body.cantidad_minima){
            res.status(409).json({ status: 409, message: 'Lo existen suficientes reclusos en el sector con la edad minima'})
        } else if (actividad != null){
            res.status(409).json({ status: 409, message: 'La actividad no puede ser creada debido a que pisaria a otra en horario'})
        }
    } catch (error: any) {
        res.status(500).json({message : error.message})
    }
}

async function remove(req: Request, res: Response) {
    try{
        const cod_actividad : any[] = [];
        cod_actividad[0] = Number(req.params.cod_actividad)
        const la_actividad_verdadera = await em.findOne(Actividad, { cod_actividad: cod_actividad[0], estado: true})
        if(la_actividad_verdadera == null) {
            res.status(404).json({ status: 404, message: 'La actividad no fue encontrada'})
        } else {
            await em.removeAndFlush(la_actividad_verdadera)
            res.status(200).json({status: 200, message: 'La actividad fue eliminada'})
        }
    } catch (error: any) {
        res.status(500).json({ message : error.message })
    }
}

export { get_all, get_one, add, remove, sanitizar_input_de_actividad, get_some }


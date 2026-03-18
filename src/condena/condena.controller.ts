import { Request, Response, NextFunction} from "express"
import { orm } from "../shared/db/orm.js"
import { Condena } from "./condena.entity.js"
import { Sentencia } from "../sentencia/sentencia.entity.js"
import { buscar_recluso } from "../recluso/recluso.controller.js"
import { get_sentencias_especificas } from "../sentencia/sentencia.controller.js"
import { throw500 } from "../shared/handle_server_side_errors/server_error_handler.js"
import { Recluso } from "../recluso/recluso.entity.js"
import { Sector } from "../sector/sector.entity.js"

const em = orm.em

async function sanitizar_input_de_condena(req:Request, res:Response, next: NextFunction) {
    const today = new Date();
    const el_recluso_verdadero = await buscar_recluso(req.body.cod_recluso)

    if(el_recluso_verdadero != null && req.body.cod_sentencias.length != 0){
        req.body.sanitized_input = {
            cod_recluso: el_recluso_verdadero,
            fecha_ini: today,
            fecha_fin_estimada: null,
            fecha_fin_real: null,
        }
        next()
    } else if (el_recluso_verdadero != null){
        return res.status(400).json({ message: 'el codigo de recluso no coincide con ninguno registrado'})
    } else if (req.body.cod_sentencias.length == 0){
        return res.status(400).json({ message: 'ninguna sentencia fue enviada'})
    }
}

async function get_all(req:Request, res:Response){
    try{
        const condenas = await em.find(Condena, {fecha_fin_real: null}, {populate: ['sentencias'], orderBy: {'fecha_ini': 'ASC'}})
        res.status(201).json({ message: 'las condenas:', data: condenas})
    } catch (error: any) {
        throw500(res)
    }
}

async function add(req: Request, res: Response){
    try{
        const nueva_condena = em.create(Condena, req.body.sanitized_input)
        const mis_sentencias = await get_sentencias_especificas(req.body.cod_sentencias)
        let duracion_en_anios = 0
        for (const una_sentencia of mis_sentencias) {
            nueva_condena.sentencias.add(una_sentencia)
            duracion_en_anios += una_sentencia.duracion_anios
        }
        let fecha = new Date()
        let la_fecha_estimada = { fecha_fin_estimada: new Date(fecha.setFullYear(fecha.getFullYear() + duracion_en_anios)) }
        await em.assign(nueva_condena, la_fecha_estimada)
        await em.flush()

        // let la_sentencia_maxima: Sentencia = mis_sentencias[0]
        // let i = 1
        // while(i < mis_sentencias.length){
        //     if(mis_sentencias[i].orden_de_gravedad > la_sentencia_maxima.orden_de_gravedad) la_sentencia_maxima = mis_sentencias[i]
        //     i++
        // }
        // let los_sectores = await get_sectores_con_sentencia(la_sentencia_maxima)
        // let j = 0
        //     if(la_celda != null) return res.status(201).json({ status: 201, celda: la_celda})
        //     j++
        // }

        let la_celda = null;
        const count = await orm.em.count(Sector)
        let i = 1;
        while(i <= count){
            let [elSector] = await orm.em.find(Sector, {cod_sector: i})
            la_celda = await elSector.encarcelar_recluso(nueva_condena.cod_recluso, em)
            if(la_celda != null) return res.status(201).json({ status: 201, celda: la_celda, fecha_fin_estimada: la_fecha_estimada})
            i++
        }

        em.removeAndFlush(nueva_condena)
        return res.status(409).json({ status: 409 })

    } catch (error: any) {
        console.log(error.message)
        throw500(res)
    }
}

async function finalizar_condenas(req:Request, res:Response){
    try{
        const today = new Date()
        const condenas = await em.find(Condena, {fecha_fin_real: null, fecha_fin_estimada: { $lt: today }}, { populate: ['cod_recluso'] })
        if(condenas.length != 0){
            let reclusos: Recluso[] = []
            let i = 0
            while(i < condenas.length){
                reclusos.push(condenas[i].cod_recluso)
                condenas[i].fecha_fin_real = today
                i++
            }

            await em.populate(reclusos, ['celda']); // si no funca es porque no hay celdas relacionadas.
            res.status(201).json({ status: 201, data: reclusos })

            const cods = reclusos.map(r => r.cod_recluso);

            await em.createQueryBuilder(Recluso)
            .update({ celda: null })
            .where({ cod_recluso: { $in: cods } })
            .execute();

            await em.flush();
        } else {
            res.status(404).json({ status: 404, message: 'no se tienen que terminar condenas'})
        }
        
        // const qb = em.createQueryBuilder(Condena);
        // await qb.update({ fecha_fin_real: today}).where({fecha_fin_real: null, fecha_fin_estimada: { $lt: today }}) 
        // si solo se tuviese que dar fin a la condena entonces se podria hacer el query builder, pero en este caso tambien se tiene que terminar la estadia del recluso en la celda asi que no se puede
        
    } catch (error: any) {
        throw500(res)
    }
}

export { get_all, add, finalizar_condenas, sanitizar_input_de_condena }


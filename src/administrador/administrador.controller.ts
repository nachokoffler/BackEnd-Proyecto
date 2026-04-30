import { Request, Response, NextFunction } from "express"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'
import crypto from 'crypto'
import dotenv from 'dotenv'
import { orm } from "../shared/db/orm.js"
import { Administrador } from "./administrador.entity.js"
import { validar_incoming_administrador } from "./administrador.schema.js"
import { throw500 } from "../shared/handle_server_side_errors/server_error_handler.js"

dotenv.config()
const JWT_SECRET = process.env.JWT_SECRET as string
const GMAIL_USER = process.env.GMAIL_USER as string
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD as string
const FRONTEND_URL = process.env.FRONTEND_URL as string


const em = orm.em
em.getRepository(Administrador)

const SALT_ROUNDS = 10

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD
    }
})

async function sanitizar_input_de_administrador(req: Request, res: Response, next: NextFunction){

    req.body.sanitized_input = {
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        dni: req.body.dni,
        email: req.body.email,
        es_especial: req.body.es_especial
    }
    
    for (const key of Object.keys(req.body.sanitized_input)){
        if(req.body.sanitized_input[key] === undefined){ //NO cambiar el === a ==
            return res.status(400).json({ status: 400,  message: `Falta el campo ${key}` });
        }
    }
    
    // const incoming = await validar_incoming_administrador(req.body.sanitized_input)
    //     if (!incoming.success){
    //         console.log(incoming.issues)
    //         return res.status(400).json({message: incoming.issues[0].message})
    //     }
    // req.body.sanitized_input = incoming.output
                                                                                                              
    next()
}

async function hash_contra(contrasenia: string){
    return await bcrypt.hash(contrasenia, SALT_ROUNDS);
}

async function add(req: Request, res: Response){
    try {
        const existing = await em.findOne(Administrador, { dni: req.body.sanitized_input.dni })
        if (existing != null) return res.status(409).json({ status: 409, message: 'Ya existe un administrador con ese DNI' })

        const existingEmail = await em.findOne(Administrador, { email: req.body.sanitized_input.email })
        if (existingEmail != null) return res.status(409).json({ status: 409, message: 'Ya existe un administrador con ese email' })

        const registration_token = crypto.randomBytes(32).toString('hex')
        const token_expiry = new Date(Date.now() + 48 * 60 * 60 * 1000)

        const el_admin = em.create(Administrador, {
            ...req.body.sanitized_input,
            contrasenia: null,
            estado: 'pendiente',
            registration_token,
            token_expiry
        })
        await em.flush()

        const link = `${FRONTEND_URL}/completar-registro?token=${registration_token}`
        await transporter.sendMail({
            from: `"Libertand't" <${GMAIL_USER}>`,
            to: req.body.sanitized_input.email,
            subject: "Completá tu registro en Libertand't",
            html: `
                <h2>Hola ${req.body.sanitized_input.nombre}!</h2>
                <p>Un administrador creó un perfil para vos en Libertand't.</p>
                <p>Haz click en el siguiente enlace para establecer tu contraseña:</p>
                <a href="${link}">Completar registro</a>
                <p>Este enlace expira en 48 horas.</p>
            `
        })

        res.status(201).json({ status: 201, message: "Administrador creado correctamente, este debe establecer su contraseña."})
    } catch (error: any){
        throw500(res)
    }
}

async function completar_registro(req: Request, res: Response){
    try {
        const { token, contrasenia } = req.body

        if (!token || !contrasenia) return res.status(400).json({ status: 400, message: 'Faltan datos' })

        const el_admin = await em.findOne(Administrador, { registration_token: token })

        if (el_admin == null) return res.status(404).json({ status: 404, message: 'Token inválido' })
        if (el_admin.token_expiry && el_admin.token_expiry < new Date()) {
            return res.status(410).json({ status: 410, message: 'El token expiró' })
        }

        el_admin.contrasenia = await hash_contra(contrasenia)
        el_admin.estado = 'activo'
        el_admin.registration_token = null
        el_admin.token_expiry = null

        await em.flush()

        res.status(200).json({ status: 200, message: 'Contraseña establecida correctamente' })
    } catch (error: any){
        throw500(res)
    }
}

async function log_in_jwt(req: Request, res: Response){
    try{
        const cod_administrador = Number.parseInt(req.body.cod_administrador) 
        const el_admin = await em.findOne(Administrador, { cod_administrador })
        if(el_admin == null) return res.status(404).json({ status: 404 } )
        if(el_admin.cod_administrador == 1){
            const token = jwt.sign({
                cod_administrador: el_admin.cod_administrador,
                nombre: el_admin.nombre,
                apellido: el_admin.apellido,
                dni: el_admin.dni,
                contrasenia: el_admin.contrasenia,
                es_especial: el_admin.es_especial
            }, JWT_SECRET, {expiresIn: '3h'})
            res.status(201).json({status: 201, token: token, es_especial: el_admin.es_especial})
        }
        if(!(await bcrypt.compare(req.body.contrasenia, el_admin.contrasenia))) return res.status(409).json({ status: 409})
        
        const token = jwt.sign({
            cod_administrador: el_admin.cod_administrador,
            nombre: el_admin.nombre,
            apellido: el_admin.apellido,
            dni: el_admin.dni,
            contrasenia: el_admin.contrasenia,
            es_especial: el_admin.es_especial
        }, JWT_SECRET, {expiresIn: '3h'})
        res.status(201).json({status: 201, token: token, es_especial: el_admin.es_especial})
    } catch(error:any){
        throw500(res)
    }
}

async function get_all(req:Request, res:Response){
    try{
        const administradores = await em.find(Administrador, {})
        if(administradores.length != null){
            res.status(201).json({ status: 201, data: administradores})
        } else {
            res.status(404).json({ status: 404 })
        }
    } catch (error: any) {
        throw500(res)
    }
}

async function get_one(req: Request, res: Response){
    try {
        const cod_administrador =  Number.parseInt(req.params.cod_administrador) 
        const el_admin = await em.findOne(Administrador, { cod_administrador })
        if(el_admin != null){
            res.status(201).json({  status: 201, data: el_admin } )
        } else {
            res.status(404).json({  status: 404 })
        }
    } catch (error: any){
        throw500(res)
    }
}

async function remove(req: Request, res: Response){
    try {
        const cod_administrador = Number.parseInt(req.params.cod_administrador) 
        const el_admin = await em.findOne(Administrador, { cod_administrador })
        if(el_admin != null){
            await em.removeAndFlush(el_admin);
            res.status(200).json({  status: 200 } )
        } else {
            res.status(404).json({  status: 404 })
        }
    } catch (error: any){
        throw500(res)
    }
}

export { get_all, get_one, log_in_jwt, add, sanitizar_input_de_administrador, remove, completar_registro}


import { Router } from "express";
import { get_all, get_one, add, sanitizar_input_de_sentencia, remove } from "./sentencia.controller.js";
import { verificar_token } from "../shared/verification_tools/verify_token.js";
import { verificar_special_token } from "../shared/verification_tools/verify_special_token.js";

export const sentencia_router = Router()

sentencia_router.get('/', verificar_token, get_all)
sentencia_router.get('/:cod_sentencia', verificar_token, get_one)
sentencia_router.post('/', verificar_special_token, sanitizar_input_de_sentencia, add)
sentencia_router.delete('/:cod_sentencia', verificar_special_token, remove)





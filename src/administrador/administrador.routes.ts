import { Router } from "express";
import { get_all, get_one, log_in_jwt, sanitizar_input_de_administrador, add, remove} from "./administrador.controller.js";
import { verificar_token } from "../shared/verification_tools/verify_token.js";
import { verificar_special_token } from "../shared/verification_tools/verify_special_token.js";

export const administrador_router = Router()

administrador_router.get('/', verificar_token, get_all)
administrador_router.get('/:cod_administrador', verificar_token, get_one)
administrador_router.post('/', verificar_special_token, sanitizar_input_de_administrador, add)
administrador_router.post('/logIn', log_in_jwt)
administrador_router.delete('/:cod_administrador', verificar_special_token, remove)





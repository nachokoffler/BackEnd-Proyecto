import { Router } from "express";
import { get_all, get_one, remove, add, sanitizar_input_de_actividad, get_some } from "./actividad.controller.js";
import { verificar_token } from "../shared/verification_tools/verify_token.js";

export const actividad_router = Router()

actividad_router.get('/', verificar_token, get_all)
actividad_router.get('/reclusos/:cod_actividad', verificar_token, get_one)
actividad_router.get('/:nombre', verificar_token, get_some)
actividad_router.post('/', verificar_token, sanitizar_input_de_actividad, add)
actividad_router.delete('/:cod_actividad', verificar_token, remove)




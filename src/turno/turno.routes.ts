import { Router } from "express";
import { get_from_sector, add_turno, end_turno, sanitizar_input_de_turno } from "./turno.controller.js";
import { verificar_token } from "../shared/verification_tools/verify_token.js";

export const turno_router = Router()

turno_router.get('/:cod_sector', verificar_token, get_from_sector)
turno_router.post('/', verificar_token, sanitizar_input_de_turno, add_turno)
turno_router.put('/', verificar_token, sanitizar_input_de_turno, end_turno)


import { Router } from "express";
import { get_all, get_one, add, sanitizar_input_de_recluso, get_some} from "./recluso.controller.js";
import { verificar_token } from "../shared/verification_tools/verify_token.js";

export const recluso_router = Router()

recluso_router.get('/', verificar_token, get_all)
recluso_router.get('/:nombre&:apellido', verificar_token, get_some)
// recluso_router.get('/:dni', verificar_token, get_one)
recluso_router.post('/', verificar_token, sanitizar_input_de_recluso, add)




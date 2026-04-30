import { Router } from "express";
import { get_all, get_one, add, finalizar_contrato, sanitizar_input_de_guardia} from "./guardia.controller.js";
import { verificar_token } from "../shared/verification_tools/verify_token.js";

export const guardia_router = Router()

guardia_router.get('/', verificar_token, get_all)
guardia_router.get('/:dni', verificar_token, get_one)
guardia_router.get('/:nombre&:apellido', verificar_token, get_one)
guardia_router.post('/', verificar_token, sanitizar_input_de_guardia, add)
guardia_router.put('/finalizarContrato', verificar_token, finalizar_contrato)



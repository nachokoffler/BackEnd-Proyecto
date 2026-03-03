import { Router } from "express";
import { get_all, get_one, get_celdas } from "./sector.controller.js";
import { verificar_token } from "../shared/verification_tools/verify_token.js";

export const sector_router = Router()

sector_router.get('/', verificar_token, get_all)
sector_router.get('/:cod_sector', verificar_token, get_one)
sector_router.get('/celdas/:cod_sector', verificar_token, get_celdas)



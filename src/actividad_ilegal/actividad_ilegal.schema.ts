import * as v from 'valibot'

const ERR_DIA_RANGE = 'El numero que representa al dia de la semana cuando ocurre la actividad debe estar entre 1 y 7'
const [NAME_LEN_MIN, NAME_LEN_MAX] = [5, 60]
const [DES_LEN_MIN, DES_LEN_MAX] = [0, 100]
const [LOC_LEN_MIN, LOC_LEN_MAX] = [5, 70]
const [HORA_MIN, HORA_MAX] = [0, 24]
const ERR_NAME_LEN = `El nombre de la actividad debe tener entre ${NAME_LEN_MIN} y ${NAME_LEN_MAX} caracteres.`
const ERR_DES_LEN = `La descripcion de la actividad debe tener entre ${DES_LEN_MIN} y ${DES_LEN_MAX} caracteres.`
const ERR_LOC_LEN = `La locacion de la actividad debe tener entre ${LOC_LEN_MIN} y ${LOC_LEN_MAX} caracteres.`
const ERR_HORA = `La hora debe de estar entre ${HORA_MIN} y ${HORA_MAX}`

const nombre = v.pipe(
    v.string(),
    v.minLength(NAME_LEN_MIN, ERR_NAME_LEN),
    v.maxLength(NAME_LEN_MAX, ERR_NAME_LEN)
)

const descripcion = v.pipe(
    v.string(),
    v.minLength(DES_LEN_MIN, ERR_DES_LEN),
    v.maxLength(DES_LEN_MAX, ERR_DES_LEN)
)

const locacion = v.pipe(
    v.string(),
    v.minLength(LOC_LEN_MIN, ERR_LOC_LEN),
    v.maxLength(LOC_LEN_MAX, ERR_LOC_LEN)
)

const dia_de_la_semana = v.pipe(
    v.number(),
    v.minValue(1, ERR_DIA_RANGE),
    v.maxValue(7, ERR_DIA_RANGE),
)

const hora_inicio = v.pipe(
    v.number(),
    v.minValue(HORA_MIN, ERR_HORA),
    v.maxValue(HORA_MAX, ERR_HORA),
)

const hora_fin = v.pipe(
    v.number(),
    v.minValue(HORA_MIN, ERR_HORA),
    v.maxValue(HORA_MAX, ERR_HORA),
)

const cantidad_maxima = v.pipe(
    v.number(),
    v.integer()
)

const actividad_ilegal_schema = v.object({
    nombre: nombre,
    descripcion: descripcion,
    locacion: locacion,
    dia_de_la_semana: dia_de_la_semana,
    hora_inicio: hora_inicio,
    hora_fin: hora_fin,
    cantidad_maxima: cantidad_maxima
})

export const validar_nueva_actividad_ilegal = v.safeParserAsync(actividad_ilegal_schema)



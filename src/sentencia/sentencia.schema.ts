import * as v from 'valibot'

const [NAME_LEN_MIN, NAME_LEN_MAX] = [5, 100]
const [DES_LEN_MIN, DES_LEN_MAX] = [0, 200]
const ERR_NAME_LEN = `El nombre de la sentencia debe tener entre ${NAME_LEN_MIN} y ${NAME_LEN_MAX} caracteres.`
const ERR_DES_LEN = `La descripcion de la sentencia debe tener entre ${DES_LEN_MIN} y ${DES_LEN_MAX} caracteres.`


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

const duracion_anios = v.pipe(
    v.number(),
    v.integer()
)

// const orden_de_gravedad = v.pipe(
//     v.number(),
//     v.integer()
// )

const sentencia_schema = v.object({
    nombre: nombre,
    descripcion: descripcion,
    duracion_anios: duracion_anios,
    // orden_de_gravedad: orden_de_gravedad
})

export const validar_nueva_sentencia = v.safeParserAsync(sentencia_schema)




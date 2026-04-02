import * as v from 'valibot'

const [NOM_APE_MIN_LEN, NOM_APE_MAX_LEN] = [1, 50]
const [CONTRA_MIN_LEN, CONTRA_MAX_LEN] = [1, 50]
const ERR_NOM_LEN = `El nombre del administrador debe tener entre ${NOM_APE_MIN_LEN} y ${NOM_APE_MAX_LEN} caracteres.`
const ERR_APE_LEN = `El apellido del administrador debe tener entre ${NOM_APE_MIN_LEN} y ${NOM_APE_MAX_LEN} caracteres.`
const ERR_CONTRA_LEN = `El nombre del administrador debe tener entre ${CONTRA_MIN_LEN} y ${CONTRA_MAX_LEN} caracteres.`
const ERR_BAD_PASS = 'La contrasenia debe ser compuesta por al menos una letra y un numero.'
const ERR_ONLY_LETTERS_AND_NUMBERS = 'Solo se permiten letras y numeros tanto en el apellido como en el nombre del administrador.'
const ERR_VAL = 'no se permiten dnis que superen 100000000'

const nombre = v.nonNullable(
    v.pipe(
        v.string(),
        v.minLength(NOM_APE_MIN_LEN, ERR_NOM_LEN),
        v.maxLength(NOM_APE_MAX_LEN, ERR_NOM_LEN),
        v.regex(
            /^[a-zA-Z0-9]*$/,
            ERR_ONLY_LETTERS_AND_NUMBERS
        )
    ),
    'el nombre no puede ser nulo'
)

const apellido = v.nonNullable( 
    v.pipe(
        v.string(),
        v.minLength(NOM_APE_MIN_LEN, ERR_APE_LEN),
        v.maxLength(NOM_APE_MAX_LEN, ERR_APE_LEN),
        v.regex(
            /^[a-zA-Z0-9]*$/,
            ERR_ONLY_LETTERS_AND_NUMBERS
        )
    ),
    'apellido no puede ser nulo'
)

const dni = v.nonNullable(
    v.pipe(
        v.number(),
        v.integer(),
        v.maxValue(100000000, ERR_VAL)
    ),
    'dni no puede ser nulo'
)


const contrasenia = v.nonNullable(
    v.pipe(
        v.string(),
        v.minLength(CONTRA_MIN_LEN, ERR_CONTRA_LEN),
        v.maxLength(CONTRA_MAX_LEN, ERR_CONTRA_LEN),
        v.regex(
            /^(?=.*[a-zA-Z])(?=.*\d).+$/,
            ERR_BAD_PASS
        )
    ),
    'contrasenia no puede ser nula'
)

const admin_schema = v.object({
    nombre: nombre,
    apellido: apellido,
    dni: dni,
    contrasenia: contrasenia,
    es_especial: v.boolean()
})

export const validar_incoming_administrador = v.safeParserAsync(admin_schema)




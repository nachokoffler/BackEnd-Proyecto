import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Administrador {
    @PrimaryKey({ nullable: false, unique: true, primary: true, autoincrement: true })
    cod_administrador !: number
    
    @Property({ nullable: false })
    nombre !: string 

    @Property({ nullable: false })
    apellido !: string

    @Property({ nullable: false })
    dni !: number

    @Property({ nullable: false, unique: true })
    email !: string
    
    @Property({ nullable: true })
    contrasenia !: string

    @Property({ nullable: false })
    es_especial !: boolean

    @Property({ nullable: true })
    registration_token !: string | null

    @Property({ nullable: true })
    token_expiry !: Date | null

    @Property({ nullable: false, default: 'pendiente' })
    estado !: string
    
    toJSON(){
        const { contrasenia, es_especial, registration_token, token_expiry, ...safeUser } = this
        return safeUser
    }
}

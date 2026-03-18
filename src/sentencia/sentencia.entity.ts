import { Entity, PrimaryKey, Property, ManyToMany } from "@mikro-orm/core";
import { Condena } from "../condena/condena.entity.js";
import { Sector } from "../sector/sector.entity.js";
import { Collection } from "@mikro-orm/core";

@Entity()
export class Sentencia {
    @PrimaryKey( {nullable: false, unique: true})
    cod_sentencia !: number

    @Property( {nullable: false, unique: true} )
    nombre !: string

    @Property( {nullable: true, unique: false} )
    descripcion ?: string
    
    @Property( {nullable: false, unique: false} )
    duracion_anios !: number
    
    // @Property( {nullable: false, unique: false} )
    // orden_de_gravedad !: number // eliminamos orden de gravedad con el fin de facilitar la creacion de sentencias

    @ManyToMany(() => Condena, (condena) => condena.sentencias, { unique : false, nullable : true, cascade: [], owner: false})
    condenas = new Collection<Condena>(this);

    // @ManyToMany(() => Sector, (sector) => sector.sentencias, { unique : false, nullable : true, cascade: [], owner: false})
    // sectores = new Collection<Sector>(this); // tambien eliminamos esta relacion para facilitar la creacion de sectores
}




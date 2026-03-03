import { Entity, ManyToOne, Property, Rel, PrimaryKeyProp, PrimaryKey, ManyToMany, Cascade } from "@mikro-orm/core";
import { Recluso } from "../recluso/recluso.entity.js";
import { Sentencia } from "../sentencia/sentencia.entity.js";
import { Collection } from "@mikro-orm/core";

@Entity()
export class Condena {
    @PrimaryKey({ nullable: false, unique: true, autoincrement: true})
    cod_condena !: number
    
    @ManyToOne(() => Recluso, { nullable: false,  primary: false })
    cod_recluso !: Rel<Recluso>

    @Property({primary: false, unique : false, nullable : false})
    fecha_ini !: Date

    @Property({unique : false, nullable : true})
    fecha_fin_estimada ?: Date

    @Property({unique : false, nullable : true})
    fecha_fin_real ?: Date

    @ManyToMany(() => Sentencia, (sentencia) => sentencia.condenas, { unique : false, nullable : true, owner: true})
    sentencias = new Collection<Sentencia>(this);

    //[PrimaryKeyProp] !: ['cod_recluso', 'fecha_ini'] se agrego cod_condena y esto quedo redundante
    
}






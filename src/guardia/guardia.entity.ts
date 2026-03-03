import { Cascade, Collection, Entity, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { Turno } from "../turno/turno.entity.js";

@Entity()
export class Guardia {
    @PrimaryKey({ nullable: false, unique: true, primary: true, autoincrement: true })
    cod_guardia !: number
    
    @Property({ nullable: false})
    nombre !: string 

    @Property({ nullable: false})
    apellido !: string

    @Property({ nullable: false})
    dni !: number

    @Property({ nullable: false})
    fecha_ini_contrato !: Date

    @Property({ nullable: true})
    fecha_fin_contrato ?: Date | null

    @OneToMany(() => Turno, (turno) => turno.cod_guardia, {cascade: [Cascade.REMOVE]})
    turnos = new Collection<Turno>(this)

    // async desvincular_turnos(em: EntityManager){
    //     if(this.turnos.isInitialized()){
    //         await em.remove(this.turnos.getItems());
    //         await em.flush();
    //     }
    // } ahora se hace en el controller.

    esta_activo() {
        if(this.fecha_fin_contrato == null){
            return true
        } else {
            return false
        }
    }
}

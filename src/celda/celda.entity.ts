import { Entity, PrimaryKey, Property, Rel, ManyToOne, PrimaryKeyProp, OneToMany, Cascade, Collection} from "@mikro-orm/core";
import { Sector } from "../sector/sector.entity.js";
import { Recluso } from "../recluso/recluso.entity.js";
import { EntityManager } from "@mikro-orm/mysql";

@Entity()
export class Celda {
    @PrimaryKey({ nullable: false, unique: true, autoincrement: true})
    cod_celda !: number

    @ManyToOne(() => Sector, { nullable: false, primary : true })
    cod_sector !: Rel<Sector>
    
    @Property({ nullable: false})
    descripcion !: string 
    
    @Property({ nullable: false})
    capacidad !: number
    
    @OneToMany(() => Recluso, (recluso) => recluso.celda, { unique : false, nullable : true, cascade: [Cascade.PERSIST]})
    reclusos = new Collection<Recluso>(this);

    [PrimaryKeyProp] !: ['cod_celda', 'cod_sector'];

    async conseguir_reclusos_con_edad(edad_minima: number){
        let r = 0
        let reclusos_habiles : any[] | null = []
        const today = new Date()
        await this.reclusos.loadItems()
        if(this.reclusos.isInitialized()){
            while(r < this.reclusos.length){
                let anios = today.getFullYear() - this.reclusos[r].fecha_nac.getFullYear();
                if(anios >= edad_minima){
                    reclusos_habiles.push(this.reclusos[r])
                }
                r++
            }
        } else {
            reclusos_habiles = null
        }

        return reclusos_habiles
    }
    
    async encarcelar_recluso(un_recluso: Recluso, em: EntityManager){
        try{
            if(this.reclusos.isInitialized()){
                if(this.capacidad > this.reclusos.length){
                    this.reclusos.add(un_recluso)
                    await em.flush()
                    return this
                } else {
                    return null
                }
            } else {
                this.reclusos.add(un_recluso)
                await em.flush()
                return this
            }
        } catch(error:any){
            console.log(error.message)
        }
    }
    
}   






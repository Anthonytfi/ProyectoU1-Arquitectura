class Tuberia {
    constructor() {
        this.filtros = []; 
    }

    agregarFiltro(filtro) {
        this.filtros.push(filtro);
        return this;
    }

    async ejecutar(datos) {
        let resultado = datos;
        
        for (let filtro of this.filtros) {
            resultado = await filtro.ejecutar(resultado);
            
            if (resultado && resultado.errorCritico) {
                console.log("Tubería detenida por error en un filtro.");
                break; 
            }
        }
        
        return resultado;
    }
}

module.exports = Tuberia;
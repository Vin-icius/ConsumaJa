using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace ProductApi.Models
{
    public class Produto
    {
        [Key]
        public int ID {get; set;}
        public Marca? Marca {get; set;}
        public Tipo? Tipo {get; set;}
        public Categoria? Categoria {get; set;}
        public String? Nome {get; set;}
        public ProdStatus Status {get; set;}
        public String? UnidadeMedida {get; set;}
        public double PrecoOriginal {get; set;}
    }
}
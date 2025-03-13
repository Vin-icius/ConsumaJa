using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace ProductApi.Models
{
    public class Tipo
    {
        [Key]
        public int ID {get; set;}
        public String? TipoNome {get; set;}
    }
}
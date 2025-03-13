using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace ProductApi.Models
{
    public class Categoria
    {
        [Key]
        public int ID {get; set;}
        public String? CategoriaNome {get; set;}
    }
}
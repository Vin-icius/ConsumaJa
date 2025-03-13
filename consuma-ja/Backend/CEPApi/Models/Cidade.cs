using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace CEPApi.Models
{
    public class Cidade
    {
        [Key]
        public int ID {get; set;}
        public String Nome {get; set;}
        public Estado Estado {get; set;}
        public ICollection<Endereco> Enderecos {get; set;}
    }
}
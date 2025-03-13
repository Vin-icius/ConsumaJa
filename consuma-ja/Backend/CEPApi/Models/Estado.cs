using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace CEPApi.Models
{
    public class Estado
    {
        [Key]
        public int ID {get; set;}
        public String Nome {get; set;}
        public String Sigla {get; set;}
        public ICollection<Cidade> Cidades {get; set;}
    }
}
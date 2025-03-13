using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace CEPApi.Models
{
    public class Endereco
    {
        [Key]
        public int ID {get; set;}
        public String Rua {get; set;}
        public String Bairro {get; set;}
        public int Numero {get; set;}
        public String CEP {get; set;}
        public String? Complemento {get; set;}
        public String? DDD {get; set;}
        public Cidade Cidade {get; set;}
    }
}
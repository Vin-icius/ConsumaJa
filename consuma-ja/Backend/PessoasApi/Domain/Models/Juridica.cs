using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PessoasApi.Models;

public class Juridica : Pessoa
{
    public String CNPJ {get; set;}
}
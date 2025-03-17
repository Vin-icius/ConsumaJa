using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PessoasApi.Models;

public class Fisica
{
    public String CPF {get;set;}
    public Boolean documentoValidado {get; set;}
    public Boolean fotoValidada {get; set;}
}

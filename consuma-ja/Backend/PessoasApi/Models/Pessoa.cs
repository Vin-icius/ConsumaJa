using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace PessoasApi.Models;

public class Pessoa
{
    public int Id {get; set;}
    public String Nome {get; set;}
    public String Email {get; set;}
    public String? Telefone {get; set;}
    public PessoaTipo Tipo {get; set;}
    public String Login {get; set;}
    public String Senha {get; set;}
    public PessoaStatus Status {get; set;}
}

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace PessoasApi.Models;

public class Pessoa
{
    [Key]
    public int Id {get; set;}
    public String Nome {get; set;}
    public String Email {get; set;}
    public String? Telefone {get; set;}
    public PessoaTipo Tipo {get; set;}
    public String? Login {get; set;} // Se for CPF ou CNPJ vai ser o email da pessoa, se for Admin, um valor diferente (ex: nome do admin)
    public String Senha {get; set;}
    public PessoaStatus Status {get; set;}
    public String? PerfilUrl {get; set;}
    public ICollection<int> EnderecosID {get; set;}
}

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace PessoasApi.Models;

[Table("PESSOA")]
public class Pessoa
{
    [Key]
    [Column("pessoa_id")]
    public int Id {get; set;}

    [Column("pessoa_nome")]
    public String Nome {get; set;}

    [Column("pessoa_email")]
    public String Email {get; set;}

    [Column("pessoa_telefone")]
    public String? Telefone {get; set;}

    [Column("pessoa_tipo")]
    public PessoaTipo Tipo {get; set;}

    [Column("pessoa_login")]
    public String? Login {get; set;} // Se for CPF ou CNPJ vai ser o email da pessoa, se for Admin, um valor diferente (ex: nome do admin)

    [Column("pessoa_senha")]
    public String Senha {get; set;}

    [Column("pessoa_status")]
    public PessoaStatus Status {get; set;}


    //public String? PerfilUrl {get; set;}
    /*
    [NotMapped]
    public IList<int> EnderecosID {get; set;}
    */
}

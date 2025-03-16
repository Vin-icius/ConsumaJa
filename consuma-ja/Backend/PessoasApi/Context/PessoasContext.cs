using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PessoasApi.Models;

namespace PessoasApi.Context
{
    public class PessoasContext : DbContext
    {
        public PessoasContext(DbContextOptions<PessoasContext> options) 
            : base(options) { }

        public DbSet<Pessoa> Pessoas { get; set; }
        public DbSet<Fisica> Fisicas { get; set; }
        public DbSet<Juridica> Juridicas { get; set; }
    }
}
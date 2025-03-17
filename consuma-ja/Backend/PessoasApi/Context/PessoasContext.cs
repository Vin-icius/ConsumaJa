using Microsoft.EntityFrameworkCore;
using PessoasApi.Models;

namespace PessoasApi.Context
{
    public class PessoasContext : DbContext
    {
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Pessoa>()
                .ToTable("PESSOA") // Mapeamento direto para a tabela
                .HasNoDiscriminator(); // <- Remove qualquer comportamento de herança

            modelBuilder.Entity<Pessoa>()
            .Property(p => p.Tipo)
            .HasConversion(
                v => v.ToString(),
                v => (PessoaTipo)Enum.Parse(typeof(PessoaTipo), v)
            );
            base.OnModelCreating(modelBuilder);
        }

        public PessoasContext(DbContextOptions<PessoasContext> options) 
            : base(options) { }
        

        public DbSet<Pessoa> Pessoas { get; set; }
        //public DbSet<Fisica> Fisicas { get; set; }
        //public DbSet<Juridica> Juridicas { get; set; }
    }
}